import express from 'express';
import { query } from '../db.js';
import { clearAuthCookie, requireAuth } from '../auth.js';
import { normalizeStickerNumbers, sortStickerNumbers } from '../utils.js';

const router = express.Router();

// GET /api/users/recent
// Returns the 8 most recently verified collectors.
router.get('/recent', async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.username, u.country, u.city, u.created_at,
            CAST(COUNT(CASE WHEN us.sticker_type = 'need' THEN 1 END) AS UNSIGNED) AS needs_count
     FROM users u
     LEFT JOIN user_stickers us ON us.user_id = u.id
     WHERE u.is_verified = 1
     GROUP BY u.id
     ORDER BY u.created_at DESC
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

router.get('/profile/:username', async (req, res) => {
  const username = String(req.params.username || '').trim();
  if (!username) return res.status(400).json({ message: 'Username required.' });

  const rows = await query(
    `SELECT u.id, u.username, u.country, u.city, u.postal_trade_enabled,
            us.sticker_number, us.sticker_type
     FROM users u
     LEFT JOIN user_stickers us ON us.user_id = u.id
     WHERE u.username = ? AND u.is_verified = 1`,
    [username]
  );

  if (!rows.length) return res.status(404).json({ message: 'User not found.' });

  const first = rows[0];
  const needs = [];
  const offers = [];
  for (const row of rows) {
    if (row.sticker_number) {
      if (row.sticker_type === 'need') needs.push(row.sticker_number);
      else offers.push(row.sticker_number);
    }
  }

  return res.json({
    user: {
      username: first.username,
      country: first.country || '',
      city: first.city || '',
      postalTradeEnabled: Boolean(first.postal_trade_enabled),
      needs: sortStickerNumbers(needs),
      offers: sortStickerNumbers(offers),
    }
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

router.get('/me/export', requireAuth, async (req, res) => {
  const [users, stickers, trades, createdMeetups, attendingMeetups, userPredictions] = await Promise.all([
    query(
      `SELECT id, username, email, country, city, postal_trade_enabled, is_verified, is_admin, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    ),
    query(
      'SELECT sticker_number, sticker_type, created_at FROM user_stickers WHERE user_id = ? ORDER BY sticker_type ASC, sticker_number ASC',
      [req.user.id]
    ),
    query(
      `SELECT id, requester_user_id, target_user_id, requested_stickers, offered_stickers, trade_method,
              phone_number, requester_full_name, postal_address, recipient_full_name, recipient_postal_address,
              location_note, status, created_at, updated_at
       FROM trade_requests
       WHERE requester_user_id = ? OR target_user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id, req.user.id]
    ),
    query(
      `SELECT id, title, description, country, city, venue, starts_at, details, created_at
       FROM meetups
       WHERE creator_user_id = ?
       ORDER BY starts_at ASC`,
      [req.user.id]
    ),
    query(
      `SELECT m.id, m.title, m.description, m.country, m.city, m.venue, m.starts_at, m.details, ma.created_at AS joined_at
       FROM meetup_attendees ma
       JOIN meetups m ON m.id = ma.meetup_id
       WHERE ma.user_id = ?
       ORDER BY m.starts_at ASC`,
      [req.user.id]
    ),
    query(
      `SELECT p.game_id, p.home_score, p.away_score, p.extra_time_played, p.extra_home_score, p.extra_away_score,
              p.penalties_played, p.penalties_home_score, p.penalties_away_score, p.points, p.created_at, p.updated_at,
              g.match_number, g.stage, g.group_name, g.home_team, g.away_team, g.starts_at, g.venue, g.city
       FROM predictions p
       JOIN wc_games g ON g.id = p.game_id
       WHERE p.user_id = ?
       ORDER BY g.starts_at ASC, g.match_number ASC`,
      [req.user.id]
    )
  ]);

  if (!users.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      country: users[0].country,
      city: users[0].city,
      postalTradeEnabled: Boolean(users[0].postal_trade_enabled),
      isVerified: Boolean(users[0].is_verified),
      isAdmin: Boolean(users[0].is_admin),
      createdAt: users[0].created_at
    },
    stickers: stickers.map((row) => ({
      number: row.sticker_number,
      type: row.sticker_type,
      createdAt: row.created_at
    })),
    trades,
    createdMeetups,
    attendingMeetups,
    predictions: userPredictions.map((row) => ({
      gameId: Number(row.game_id),
      matchNumber: Number(row.match_number),
      stage: row.stage,
      group: row.group_name,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      startsAt: row.starts_at,
      venue: row.venue,
      city: row.city,
      homeScore: Number(row.home_score),
      awayScore: Number(row.away_score),
      extraTimePlayed: Boolean(row.extra_time_played),
      extraHomeScore: row.extra_home_score != null ? Number(row.extra_home_score) : null,
      extraAwayScore: row.extra_away_score != null ? Number(row.extra_away_score) : null,
      penaltiesPlayed: Boolean(row.penalties_played),
      penaltiesHomeScore: row.penalties_home_score != null ? Number(row.penalties_home_score) : null,
      penaltiesAwayScore: row.penalties_away_score != null ? Number(row.penalties_away_score) : null,
      points: row.points != null ? Number(row.points) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="world-cup-stuff-user-${req.user.id}-export.json"`);
  return res.status(200).send(JSON.stringify(payload, null, 2));
});

router.delete('/me', requireAuth, async (req, res) => {
  const result = await query('DELETE FROM users WHERE id = ?', [req.user.id]);

  if (!result.affectedRows) {
    return res.status(404).json({ message: 'User not found.' });
  }

  clearAuthCookie(res);
  return res.json({ message: 'Account deleted permanently.' });
});

export default router;
