import express from 'express';
import { requireAuth } from '../auth.js';
import { query, runInTransaction } from '../db.js';
import { normalizeStickerNumbers } from '../utils.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const trades = await query(
    `SELECT
       tr.id,
       tr.requested_stickers,
       tr.offered_stickers,
       tr.trade_method,
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
    locationNote = ''
  } = req.body;

  const requested = normalizeStickerNumbers(requestedStickers);
  const offered = normalizeStickerNumbers(offeredStickers);

  if (!targetUserId || !requested.length || !offered.length) {
    return res.status(400).json({ message: 'Target user, requested stickers and offered stickers are required.' });
  }

  if (Number(targetUserId) === Number(req.user.id)) {
    return res.status(400).json({ message: 'You cannot create a trade request for yourself.' });
  }

  const targetUsers = await query(
    'SELECT id, is_verified FROM users WHERE id = ? LIMIT 1',
    [Number(targetUserId)]
  );

  if (!targetUsers.length || !targetUsers[0].is_verified) {
    return res.status(404).json({ message: 'Target user not found.' });
  }

  await query(
    `INSERT INTO trade_requests
       (requester_user_id, target_user_id, requested_stickers, offered_stickers, trade_method, location_note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      Number(targetUserId),
      requested.join(','),
      offered.join(','),
      tradeMethod === 'post' ? 'post' : 'in_person',
      locationNote.trim()
    ]
  );

  return res.status(201).json({ message: 'Trade request sent.' });
});

router.put('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;

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

  await runInTransaction(async (connection) => {
    await connection.query('UPDATE trade_requests SET status = ? WHERE id = ?', [status, req.params.id]);

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

export default router;
