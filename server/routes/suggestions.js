import express from 'express';
import { query } from '../db.js';
import { attachOptionalAuth } from '../auth.js';

const router = express.Router();

router.post('/', attachOptionalAuth, async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({ message: 'Message must be 2000 characters or fewer.' });
  }

  const userId = req.user?.id ?? null;

  await query(
    'INSERT INTO suggestions (user_id, message) VALUES (?, ?)',
    [userId, message.trim()]
  );

  res.json({ ok: true });
});

export default router;
