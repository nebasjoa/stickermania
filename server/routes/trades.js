import express from 'express';
import { requireAuth } from '../auth.js';
import { query, runInTransaction } from '../db.js';
import { sendTradeRequestEmail } from '../mailer.js';
import { normalizeStickerNumbers } from '../utils.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const trades = await query(
    `SELECT
       tr.id,
       tr.requested_stickers,
       tr.offered_stickers,
       tr.trade_method,
       tr.phone_number,
       tr.requester_full_name,
       tr.postal_address,
       tr.recipient_full_name,
       tr.recipient_postal_address,
       tr.location_note,
       tr.status,
       tr.created_at,
       tr.requester_user_id,
       tr.target_user_id,
       requester.username AS requester_username,
       target.username AS target_username
     FROM trade_requests tr
     JOIN users requester ON requester.id = tr.requester_user_id
     JOIN users target ON target.id = tr.target_user_id
     WHERE tr.requester_user_id = ? OR tr.target_user_id = ?
     ORDER BY tr.created_at DESC`,
    [req.user.id, req.user.id]
  );

  return res.json({ trades });
});

router.post('/', requireAuth, async (req, res) => {
  const {
    targetUserId,
    requestedStickers = '',
    offeredStickers = '',
    tradeMethod = 'in_person',
    phoneNumber = '',
    fullName = '',
    postalAddress = '',
    locationNote = ''
  } = req.body;

  const requested = normalizeStickerNumbers(requestedStickers);
  const offered = normalizeStickerNumbers(offeredStickers);
  const normalizedTradeMethod = tradeMethod === 'post' ? 'post' : 'in_person';
  const trimmedPhoneNumber = String(phoneNumber || '').trim();
  const trimmedFullName = String(fullName || '').trim();
  const trimmedPostalAddress = String(postalAddress || '').trim();
  const trimmedLocationNote = String(locationNote || '').trim();

  if (!targetUserId || !requested.length || !offered.length) {
    return res.status(400).json({ message: 'Target user, requested stickers and offered stickers are required.' });
  }

  if (!trimmedPhoneNumber) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  if (normalizedTradeMethod === 'post' && !trimmedFullName) {
    return res.status(400).json({ message: 'Full name is required for postal trades.' });
  }

  if (normalizedTradeMethod === 'post' && !trimmedPostalAddress) {
    return res.status(400).json({ message: 'Postal address is required for postal trades.' });
  }

  if (Number(targetUserId) === Number(req.user.id)) {
    return res.status(400).json({ message: 'You cannot create a trade request for yourself.' });
  }

  const targetUsers = await query(
    'SELECT id, username, email, is_verified FROM users WHERE id = ? LIMIT 1',
    [Number(targetUserId)]
  );

  if (!targetUsers.length || !targetUsers[0].is_verified) {
    return res.status(404).json({ message: 'Target user not found.' });
  }

  await query(
    `INSERT INTO trade_requests
       (requester_user_id, target_user_id, requested_stickers, offered_stickers, trade_method, phone_number, requester_full_name, postal_address, location_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      Number(targetUserId),
      requested.join(','),
      offered.join(','),
      normalizedTradeMethod,
      trimmedPhoneNumber,
      normalizedTradeMethod === 'post' ? trimmedFullName : '',
      normalizedTradeMethod === 'post' ? trimmedPostalAddress : '',
      trimmedLocationNote
    ]
  );

  try {
    await sendTradeRequestEmail({
      email: targetUsers[0].email,
      targetUsername: targetUsers[0].username,
      requesterUsername: req.user.username,
      requestedStickers: requested,
      offeredStickers: offered,
      tradeMethod: normalizedTradeMethod
    });
  } catch (error) {
    console.error('[trades] Trade created but notification email failed:', error);
  }

  return res.status(201).json({ message: 'Trade request sent.' });
});

router.put('/:id/status', requireAuth, async (req, res) => {
  const { status, recipientFullName = '', recipientPostalAddress = '' } = req.body;

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid trade status.' });
  }

  const trades = await query(
    `SELECT
       id,
       requester_user_id,
       target_user_id,
       requested_stickers,
       offered_stickers,
       trade_method,
       status
     FROM trade_requests
     WHERE id = ?
     LIMIT 1`,
    [req.params.id]
  );

  if (!trades.length) {
    return res.status(404).json({ message: 'Trade request not found.' });
  }

  if (Number(trades[0].target_user_id) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Only the target user can update this request.' });
  }

  if (trades[0].status !== 'pending') {
    return res.status(409).json({ message: 'This trade request has already been processed.' });
  }

  const trimmedRecipientFullName = String(recipientFullName || '').trim();
  const trimmedRecipientPostalAddress = String(recipientPostalAddress || '').trim();

  if (status === 'accepted' && trades[0].trade_method === 'post' && !trimmedRecipientFullName) {
    return res.status(400).json({ message: 'Recipient full name is required for postal trades.' });
  }

  if (status === 'accepted' && trades[0].trade_method === 'post' && !trimmedRecipientPostalAddress) {
    return res.status(400).json({ message: 'Recipient postal address is required for postal trades.' });
  }

  await runInTransaction(async (connection) => {
    await connection.query(
      'UPDATE trade_requests SET status = ?, recipient_full_name = ?, recipient_postal_address = ? WHERE id = ?',
      [
        status,
        status === 'accepted' && trades[0].trade_method === 'post' ? trimmedRecipientFullName : '',
        status === 'accepted' && trades[0].trade_method === 'post' ? trimmedRecipientPostalAddress : '',
        req.params.id
      ]
    );

    if (status !== 'accepted') {
      return;
    }

    const requested = normalizeStickerNumbers(trades[0].requested_stickers);
    const offered = normalizeStickerNumbers(trades[0].offered_stickers);

    for (const sticker of requested) {
      await connection.query(
        'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
        [trades[0].target_user_id, sticker, 'offer']
      );
      await connection.query(
        'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
        [trades[0].requester_user_id, sticker, 'need']
      );
    }

    for (const sticker of offered) {
      await connection.query(
        'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
        [trades[0].requester_user_id, sticker, 'offer']
      );
      await connection.query(
        'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
        [trades[0].target_user_id, sticker, 'need']
      );
    }
  });

  return res.json({
    message: status === 'accepted'
      ? 'Trade request accepted and both collections were updated.'
      : 'Trade request declined.'
  });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const trades = await query(
    `SELECT
       id,
       requester_user_id,
       target_user_id,
       status
     FROM trade_requests
     WHERE id = ?
     LIMIT 1`,
    [req.params.id]
  );

  if (!trades.length) {
    return res.status(404).json({ message: 'Trade request not found.' });
  }

  const trade = trades[0];
  const isParticipant =
    Number(trade.requester_user_id) === Number(req.user.id) ||
    Number(trade.target_user_id) === Number(req.user.id);

  if (!isParticipant) {
    return res.status(403).json({ message: 'You cannot remove this trade request.' });
  }

  if (trade.status !== 'declined') {
    return res.status(409).json({ message: 'Only declined trade requests can be removed.' });
  }

  await query('DELETE FROM trade_requests WHERE id = ?', [req.params.id]);

  return res.json({ message: 'Declined trade request removed.' });
});

export default router;
