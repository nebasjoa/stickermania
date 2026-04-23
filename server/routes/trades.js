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
       tr.cancellation_reason,
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
  const { status, recipientFullName = '', recipientPostalAddress = '', cancellationReason = '' } = req.body;

  const VALID_STATUSES = ['accepted', 'declined', 'sent', 'done', 'cancelled'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid trade status.' });
  }

  const trades = await query(
    `SELECT id, requester_user_id, target_user_id, requested_stickers, offered_stickers, trade_method, status
     FROM trade_requests WHERE id = ? LIMIT 1`,
    [req.params.id]
  );

  if (!trades.length) {
    return res.status(404).json({ message: 'Trade request not found.' });
  }

  const trade = trades[0];
  const isRequester = Number(trade.requester_user_id) === Number(req.user.id);
  const isTarget    = Number(trade.target_user_id)    === Number(req.user.id);

  if (!isRequester && !isTarget) {
    return res.status(403).json({ message: 'You are not part of this trade.' });
  }

  // accept / decline: target only
  if ((status === 'accepted' || status === 'declined') && !isTarget) {
    return res.status(403).json({ message: 'Only the target user can accept or decline this request.' });
  }

  // sent: requester only
  if (status === 'sent' && !isRequester) {
    return res.status(403).json({ message: 'Only the requester can mark a trade as sent.' });
  }

  // valid state-machine transitions
  const VALID_FROM = {
    accepted:  ['pending'],
    declined:  ['pending'],
    sent:      ['accepted'],
    done:      ['accepted', 'sent'],
    cancelled: ['accepted', 'sent'],
  };

  if (!VALID_FROM[status].includes(trade.status)) {
    return res.status(409).json({ message: `Cannot change status from '${trade.status}' to '${status}'.` });
  }

  const trimmedRecipientFullName     = String(recipientFullName || '').trim();
  const trimmedRecipientPostalAddress = String(recipientPostalAddress || '').trim();
  const trimmedCancellationReason    = String(cancellationReason || '').trim();

  if (status === 'accepted' && trade.trade_method === 'post' && !trimmedRecipientFullName) {
    return res.status(400).json({ message: 'Recipient full name is required for postal trades.' });
  }
  if (status === 'accepted' && trade.trade_method === 'post' && !trimmedRecipientPostalAddress) {
    return res.status(400).json({ message: 'Recipient postal address is required for postal trades.' });
  }
  if (status === 'cancelled' && !trimmedCancellationReason) {
    return res.status(400).json({ message: 'A cancellation reason is required.' });
  }

  await runInTransaction(async (connection) => {
    if (status === 'accepted') {
      await connection.query(
        'UPDATE trade_requests SET status = ?, recipient_full_name = ?, recipient_postal_address = ? WHERE id = ?',
        [
          'accepted',
          trade.trade_method === 'post' ? trimmedRecipientFullName : '',
          trade.trade_method === 'post' ? trimmedRecipientPostalAddress : '',
          req.params.id
        ]
      );

      const requested = normalizeStickerNumbers(trade.requested_stickers);
      const offered   = normalizeStickerNumbers(trade.offered_stickers);

      for (const sticker of requested) {
        await connection.query(
          'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
          [trade.target_user_id, sticker, 'offer']
        );
        await connection.query(
          'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
          [trade.requester_user_id, sticker, 'need']
        );
      }
      for (const sticker of offered) {
        await connection.query(
          'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
          [trade.requester_user_id, sticker, 'offer']
        );
        await connection.query(
          'DELETE FROM user_stickers WHERE user_id = ? AND sticker_number = ? AND sticker_type = ?',
          [trade.target_user_id, sticker, 'need']
        );
      }
    } else if (status === 'cancelled') {
      await connection.query(
        'UPDATE trade_requests SET status = ?, cancellation_reason = ? WHERE id = ?',
        ['cancelled', trimmedCancellationReason, req.params.id]
      );

      // Restore stickers removed when trade was originally accepted
      const requested = normalizeStickerNumbers(trade.requested_stickers);
      const offered   = normalizeStickerNumbers(trade.offered_stickers);

      for (const sticker of requested) {
        await connection.query(
          'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
          [trade.target_user_id, sticker, 'offer']
        );
        await connection.query(
          'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
          [trade.requester_user_id, sticker, 'need']
        );
      }
      for (const sticker of offered) {
        await connection.query(
          'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
          [trade.requester_user_id, sticker, 'offer']
        );
        await connection.query(
          'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
          [trade.target_user_id, sticker, 'need']
        );
      }
    } else {
      // sent, done, declined — simple status update
      await connection.query(
        'UPDATE trade_requests SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
    }
  });

  const MESSAGES = {
    accepted:  'Trade accepted and both collections were updated.',
    declined:  'Trade request declined.',
    sent:      'Trade marked as sent.',
    done:      'Trade marked as done.',
    cancelled: 'Trade cancelled and stickers restored to both collections.',
  };

  return res.json({ message: MESSAGES[status] });
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

  if (!['declined', 'cancelled', 'done'].includes(trade.status)) {
    return res.status(409).json({ message: 'Only declined, cancelled, or done trade requests can be removed.' });
  }

  await query('DELETE FROM trade_requests WHERE id = ?', [req.params.id]);

  return res.json({ message: 'Declined trade request removed.' });
});

export default router;
