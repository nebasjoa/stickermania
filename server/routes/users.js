import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { normalizeStickerNumbers, sortStickerNumbers } from '../utils.js';

const router = express.Router();

// GET /api/users/recent
// Returns the 8 most recently verified collectors.
router.get('/recent', async (req, res) => {
  const rows = await query(
    `SELECT id, username, country, city, created_at
     FROM users
     WHERE is_verified = 1
     ORDER BY created_at DESC
     LIMIT 8`
  );
  return res.json({ users: rows });
});

router.get('/search', requireAuth, async (req, res) => {
  const stickerNumbers = normalizeStickerNumbers(req.query.numbers || '');
  const country = String(req.query.country || '').trim();
  const city = String(req.query.city || '').trim();
  const filters = [
    'u.id <> ?',
    'u.is_verified = 1'
  ];
  const params = [req.user.id];

  if (stickerNumbers.length) {
    const placeholders = stickerNumbers.map(() => '?').join(', ');
    filters.push(
      `EXISTS (
         SELECT 1
         FROM user_stickers us_filter
         WHERE us_filter.user_id = u.id
           AND us_filter.sticker_type = 'offer'
           AND us_filter.sticker_number IN (${placeholders})
       )`
    );
    params.push(...stickerNumbers);
  }

  if (country) {
    filters.push('LOWER(u.country) = LOWER(?)');
    params.push(country);
  }

  if (city) {
    filters.push('LOWER(u.city) = LOWER(?)');
    params.push(city);
  }

  const rows = await query(
    `SELECT
       u.id,
       u.username,
       u.country,
       u.city,
       u.postal_trade_enabled,
       us.sticker_number,
       us.sticker_type
     FROM users u
     LEFT JOIN user_stickers us ON us.user_id = u.id
     WHERE ${filters.join(' AND ')}
     ORDER BY u.username ASC, us.sticker_number ASC`,
    params
  );

  const userMap = new Map();

  for (const row of rows) {
    if (!userMap.has(row.id)) {
      userMap.set(row.id, {
        id: row.id,
        username: row.username,
        country: row.country,
        city: row.city,
        postalTradeEnabled: Boolean(row.postal_trade_enabled),
        needs: [],
        offers: []
      });
    }

    const user = userMap.get(row.id);
    if (row.sticker_number) {
      if (row.sticker_type === 'need') {
        user.needs.push(row.sticker_number);
      } else {
        user.offers.push(row.sticker_number);
      }
    }
  }

  return res.json({
    users: [...userMap.values()].map((user) => ({
      ...user,
      needs: sortStickerNumbers(user.needs),
      offers: sortStickerNumbers(user.offers)
    }))
  });
});

router.put('/me/stickers', requireAuth, async (req, res) => {
  const needs = normalizeStickerNumbers(req.body.needs || '');
  const offers = normalizeStickerNumbers(req.body.offers || '');

  await query('DELETE FROM user_stickers WHERE user_id = ?', [req.user.id]);

  for (const sticker of needs) {
    await query(
      'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
      [req.user.id, sticker, 'need']
    );
  }

  for (const sticker of offers) {
    await query(
      'INSERT IGNORE INTO user_stickers (user_id, sticker_number, sticker_type) VALUES (?, ?, ?)',
      [req.user.id, sticker, 'offer']
    );
  }

  return res.json({ message: 'Sticker list updated.' });
});

router.put('/me/profile', requireAuth, async (req, res) => {
  const { country = '', city = '', postalTradeEnabled = true } = req.body;

  await query(
    'UPDATE users SET country = ?, city = ?, postal_trade_enabled = ? WHERE id = ?',
    [country.trim(), city.trim(), postalTradeEnabled ? 1 : 0, req.user.id]
  );

  return res.json({ message: 'Profile updated.' });
});

export default router;
