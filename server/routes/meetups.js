import express from 'express';
import { query } from '../db.js';
import { attachOptionalAuth, requireAuth } from '../auth.js';

const router = express.Router();
const MAX_MEETUPS_PER_USER = 3;

router.get('/', attachOptionalAuth, async (req, res) => {
  const country = String(req.query.country || '').trim();
  const city = String(req.query.city || '').trim();
  const filters = ['1 = 1'];
  const params = [];

  if (country) {
    filters.push('LOWER(m.country) = LOWER(?)');
    params.push(country);
  }

  if (city) {
    filters.push('LOWER(m.city) = LOWER(?)');
    params.push(city);
  }

  const rows = await query(
    `SELECT
       m.id,
       m.title,
       m.description,
       m.country,
       m.city,
       m.venue,
       m.starts_at,
       m.details,
       m.creator_user_id,
       u.username AS creator_username,
       COUNT(DISTINCT ma.user_id) AS attendee_count
     FROM meetups m
     JOIN users u ON u.id = m.creator_user_id
     LEFT JOIN meetup_attendees ma ON ma.meetup_id = m.id
     WHERE ${filters.join(' AND ')}
     GROUP BY
       m.id,
       m.title,
       m.description,
       m.country,
       m.city,
       m.venue,
       m.starts_at,
       m.details,
       m.creator_user_id,
       u.username
     ORDER BY m.starts_at ASC`,
    params
  );

  let attendingIds = [];
  if (req.user?.id) {
    const attendanceRows = await query(
      'SELECT meetup_id FROM meetup_attendees WHERE user_id = ?',
      [req.user.id]
    );
    attendingIds = attendanceRows.map((row) => Number(row.meetup_id));
  }

  return res.json({
    meetups: rows.map((row) => ({
      ...row,
      attendee_count: Number(row.attendee_count),
      isAttending: attendingIds.includes(Number(row.id))
    }))
  });
});

router.post('/', requireAuth, async (req, res) => {
  const {
    title,
    description,
    country,
    city,
    venue = '',
    startsAt,
    details = ''
  } = req.body;

  if (!title || !description || !country || !city || !startsAt) {
    return res.status(400).json({ message: 'Title, description, country, city, and start date are required.' });
  }

  const startsAtDate = new Date(startsAt);
  if (Number.isNaN(startsAtDate.getTime())) {
    return res.status(400).json({ message: 'Invalid meetup start date.' });
  }

  const existingMeetups = await query(
    'SELECT COUNT(*) AS meetup_count FROM meetups WHERE creator_user_id = ?',
    [req.user.id]
  );

  if (Number(existingMeetups[0]?.meetup_count || 0) >= MAX_MEETUPS_PER_USER) {
    return res.status(400).json({ message: `You can create up to ${MAX_MEETUPS_PER_USER} meetups.` });
  }

  await query(
    `INSERT INTO meetups
       (creator_user_id, title, description, country, city, venue, starts_at, details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      String(title).trim(),
      String(description).trim(),
      String(country).trim(),
      String(city).trim(),
      String(venue).trim(),
      startsAtDate,
      String(details).trim()
    ]
  );

  return res.status(201).json({ message: 'Meetup created.' });
});

router.post('/:id/attend', requireAuth, async (req, res) => {
  const { attending = true } = req.body;
  const meetupId = Number(req.params.id);

  if (!meetupId) {
    return res.status(400).json({ message: 'Invalid meetup id.' });
  }

  const meetups = await query('SELECT id FROM meetups WHERE id = ? LIMIT 1', [meetupId]);
  if (!meetups.length) {
    return res.status(404).json({ message: 'Meetup not found.' });
  }

  if (attending) {
    await query(
      'INSERT IGNORE INTO meetup_attendees (meetup_id, user_id) VALUES (?, ?)',
      [meetupId, req.user.id]
    );

    return res.json({ message: 'Attendance confirmed.' });
  }

  await query(
    'DELETE FROM meetup_attendees WHERE meetup_id = ? AND user_id = ?',
    [meetupId, req.user.id]
  );

  return res.json({ message: 'Attendance cancelled.' });
});

export default router;
