import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { clearAuthCookie, requireAuth, setAuthCookie } from '../auth.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../mailer.js';
import { createVerificationToken, normalizeStickerNumbers } from '../utils.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const {
    username,
    email,
    password,
    country = '',
    city = '',
    postalTradeEnabled = true,
    needs = '',
    offers = ''
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required.' });
  }

  const existingUsers = await query(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
    [username.trim(), email.trim().toLowerCase()]
  );

  if (existingUsers.length) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (username, email, password_hash, country, city, postal_trade_enabled)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username.trim(), email.trim().toLowerCase(), passwordHash, country.trim(), city.trim(), postalTradeEnabled ? 1 : 0]
  );

  const userId = Number(result.insertId);
  const wanted = normalizeStickerNumbers(needs);
  const available = normalizeStickerNumbers(offers);

  for (const sticker of wanted) {
    await query(
      'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
      [userId, sticker, 'need']
    );
  }

  for (const sticker of available) {
    await query(
      'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
      [userId, sticker, 'offer']
    );
  }

  const token = createVerificationToken();
  await query('INSERT INTO verification_tokens (user_id, token) VALUES (?, ?)', [userId, token]);

  const emailResult = await sendVerificationEmail({ email, username, token });

  return res.status(201).json({
    message: emailResult.delivered
      ? 'Account created. Check your email to verify the account before logging in.'
      : emailResult.skippedInDevelopment
        ? 'Account created. Development mode skips Resend email, so use the returned verification token locally.'
      : 'Account created. Resend is not configured, so use the returned verification token locally.',
    verificationToken: emailResult.delivered ? undefined : token
  });
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  const tokens = await query(
    `SELECT vt.id, vt.user_id, u.username, u.email
     FROM verification_tokens vt
     JOIN users u ON u.id = vt.user_id
     WHERE vt.token = ?
     LIMIT 1`,
    [token]
  );

  if (!tokens.length) {
    return res.status(404).json({ message: 'Invalid or expired verification token.' });
  }

  const verification = tokens[0];
  await query('UPDATE users SET is_verified = 1 WHERE id = ?', [verification.user_id]);
  await query('DELETE FROM verification_tokens WHERE user_id = ?', [verification.user_id]);

  return res.json({ message: 'Email verified successfully. You can log in now.' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const users = await query(
    `SELECT id, username, email, password_hash, is_verified, is_admin, country, city, postal_trade_enabled
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email.trim().toLowerCase()]
  );

  if (!users.length) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const user = users[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (!user.is_verified) {
    return res.status(403).json({ message: 'Verify your email before logging in.' });
  }

  setAuthCookie(res, user);

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      country: user.country,
      city: user.city,
      postalTradeEnabled: Boolean(user.postal_trade_enabled),
      isAdmin: Boolean(user.is_admin)
    }
  });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const users = await query(
    'SELECT id, username, email FROM users WHERE email = ? AND is_verified = 1 LIMIT 1',
    [email.trim().toLowerCase()]
  );

  // Always return the same response to avoid leaking whether an email is registered
  if (!users.length) {
    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  const user = users[0];
  const token = createVerificationToken();

  await query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
  await query('INSERT INTO password_reset_tokens (user_id, token) VALUES (?, ?)', [user.id, token]);

  const emailResult = await sendPasswordResetEmail({ email: user.email, username: user.username, token });

  return res.json({
    message: 'If that email is registered, a reset link has been sent.',
    resetToken: emailResult.delivered ? undefined : token
  });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const tokens = await query(
    `SELECT prt.id, prt.user_id, prt.created_at, u.username, u.email
     FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.token = ?
     LIMIT 1`,
    [token]
  );

  if (!tokens.length) {
    return res.status(404).json({ message: 'Invalid or expired reset token.' });
  }

  const record = tokens[0];
  const ageMs = Date.now() - new Date(record.created_at).getTime();
  if (ageMs > 60 * 60 * 1000) {
    await query('DELETE FROM password_reset_tokens WHERE id = ?', [record.id]);
    return res.status(410).json({ message: 'Reset token has expired. Please request a new one.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, record.user_id]);
  await query('DELETE FROM password_reset_tokens WHERE user_id = ?', [record.user_id]);

  return res.json({ message: 'Password updated successfully. You can now log in.' });
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out.' });
});

router.get('/me', requireAuth, async (req, res) => {
  const users = await query(
    `SELECT id, username, email, is_admin, country, city, postal_trade_enabled
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [req.user.id]
  );

  if (!users.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const stickers = await query(
    'SELECT sticker_number, sticker_type FROM user_stickers WHERE user_id = ? ORDER BY sticker_number ASC',
    [req.user.id]
  );

  const needs = stickers.filter((item) => item.sticker_type === 'need').map((item) => item.sticker_number);
  const offers = stickers.filter((item) => item.sticker_type === 'offer').map((item) => item.sticker_number);

  return res.json({
    user: {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      country: users[0].country,
      city: users[0].city,
      postalTradeEnabled: Boolean(users[0].postal_trade_enabled),
      isAdmin: Boolean(users[0].is_admin),
      needs,
      offers
    }
  });
});

export default router;
