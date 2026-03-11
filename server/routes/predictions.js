import express from 'express';
import { attachOptionalAuth, requireAdmin, requireAuth } from '../auth.js';
import { query } from '../db.js';

const router = express.Router();

// GET /api/predictions/upcoming
// Returns games for the next calendar date (UTC) that has fixtures, or today's games if any exist.
router.get('/upcoming', async (req, res) => {
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const rows = await query(
    `SELECT id, match_number, group_name, home_team, away_team, starts_at, venue, city
     FROM wc_games
     WHERE DATE(starts_at) >= ?
     ORDER BY starts_at ASC, match_number ASC
     LIMIT 1`,
    [now]
  );
  if (!rows.length) return res.json({ date: null, games: [] });

  const nextDate = new Date(rows[0].starts_at).toISOString().slice(0, 10);
  const games = await query(
    `SELECT id, match_number, group_name, home_team, away_team, starts_at, venue, city
     FROM wc_games
     WHERE DATE(starts_at) = ?
     ORDER BY starts_at ASC, match_number ASC`,
    [nextDate]
  );
  return res.json({
    date: nextDate,
    games: games.map((g) => ({
      id: Number(g.id),
      matchNumber: Number(g.match_number),
      group: g.group_name,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      startsAt: g.starts_at,
      venue: g.venue,
      city: g.city,
    }))
  });
});

// GET /api/predictions/standings
// Returns group standings computed from actual results recorded so far.
router.get('/standings', async (req, res) => {
  const games = await query(
    `SELECT group_name, home_team, away_team, actual_home, actual_away
     FROM wc_games
     WHERE stage = 'group'
     ORDER BY group_name ASC, match_number ASC`
  );

  // Build a map: group -> team -> stats
  const groups = {};
  for (const g of games) {
    const grp = g.group_name;
    if (!groups[grp]) groups[grp] = {};
    for (const team of [g.home_team, g.away_team]) {
      if (!groups[grp][team]) {
        groups[grp][team] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
      }
    }
    if (g.actual_home == null) continue; // no result yet

    const ah = Number(g.actual_home), aa = Number(g.actual_away);
    const ht = groups[grp][g.home_team], at = groups[grp][g.away_team];
    ht.played++; ht.gf += ah; ht.ga += aa;
    at.played++; at.gf += aa; at.ga += ah;
    if (ah > aa)      { ht.won++;   ht.pts += 3; at.lost++; }
    else if (ah < aa) { at.won++;   at.pts += 3; ht.lost++; }
    else              { ht.drawn++; ht.pts++;    at.drawn++; at.pts++; }
  }

  const result = {};
  for (const [grp, teams] of Object.entries(groups)) {
    result[grp] = Object.entries(teams)
      .map(([name, s]) => ({ name, ...s, gd: s.gf - s.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }

  return res.json({ standings: result });
});

// GET /api/predictions/games
// Returns all 72 fixtures; includes the authenticated user's prediction on each game (if any).
router.get('/games', attachOptionalAuth, async (req, res) => {
  const games = await query(
    `SELECT id, match_number, group_name, stage, home_team, away_team, starts_at, venue, city,
            actual_home, actual_away
     FROM wc_games
     ORDER BY starts_at ASC, match_number ASC`
  );

  let userPredictions = [];
  if (req.user?.id) {
    userPredictions = await query(
      'SELECT game_id, home_score, away_score FROM predictions WHERE user_id = ?',
      [req.user.id]
    );
  }

  const predictionMap = {};
  for (const p of userPredictions) {
    predictionMap[Number(p.game_id)] = {
      homeScore: Number(p.home_score),
      awayScore: Number(p.away_score)
    };
  }

  return res.json({
    games: games.map((g) => ({
      id: Number(g.id),
      matchNumber: Number(g.match_number),
      group: g.group_name,
      stage: g.stage,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      startsAt: g.starts_at,
      venue: g.venue,
      city: g.city,
      actualHome: g.actual_home != null ? Number(g.actual_home) : null,
      actualAway: g.actual_away != null ? Number(g.actual_away) : null,
      prediction: predictionMap[Number(g.id)] ?? null
    }))
  });
});

// GET /api/predictions/leaderboard
// Returns top users ranked by number of submitted predictions.
router.get('/leaderboard', async (req, res) => {
  const rows = await query(
    `SELECT u.username, u.country, u.city,
            COUNT(p.id) AS prediction_count,
            COALESCE(SUM(p.points), 0) AS total_points
     FROM users u
     JOIN predictions p ON p.user_id = u.id
     GROUP BY u.id, u.username, u.country, u.city
     ORDER BY total_points DESC, prediction_count DESC
     LIMIT 10`
  );
  return res.json({
    leaderboard: rows.map((r) => ({
      username: r.username,
      country: r.country,
      city: r.city,
      count: Number(r.prediction_count),
      points: Number(r.total_points)
    }))
  });
});

// PUT /api/predictions/games/:id
// Upsert a score prediction for a fixture. Game must not have started yet.
router.put('/games/:id', requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);
  const { homeScore, awayScore } = req.body;
  const isClearingPrediction = homeScore === '' && awayScore === '';

  if (!gameId) {
    return res.status(400).json({ message: 'Invalid game id.' });
  }

  if (!isClearingPrediction && (
    homeScore == null || awayScore == null || !Number.isInteger(Number(homeScore)) || !Number.isInteger(Number(awayScore))
  )) {
    return res.status(400).json({ message: 'homeScore and awayScore must be integers.' });
  }

  const games = await query(
    'SELECT id, starts_at FROM wc_games WHERE id = ? LIMIT 1',
    [gameId]
  );

  if (!games.length) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  if (new Date(games[0].starts_at) <= new Date()) {
    return res.status(409).json({ message: 'Predictions are locked once the game has started.' });
  }

  if (isClearingPrediction) {
    await query(
      'DELETE FROM predictions WHERE user_id = ? AND game_id = ?',
      [req.user.id, gameId]
    );

    return res.json({ message: 'Prediction cleared.' });
  }

  const home = Number(homeScore);
  const away = Number(awayScore);

  if (home < 0 || home > 20 || away < 0 || away > 20) {
    return res.status(400).json({ message: 'Scores must be between 0 and 20.' });
  }

  await query(
    `INSERT INTO predictions (user_id, game_id, home_score, away_score)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE home_score = VALUES(home_score), away_score = VALUES(away_score)`,
    [req.user.id, gameId, home, away]
  );

  return res.json({ message: 'Prediction saved.' });
});

// PUT /api/predictions/games/:id/result
// Record the actual final score for a game and auto-score all predictions for it.
// Points: 3 for exact score, 1 for correct outcome, 0 otherwise.
router.put('/games/:id/result', requireAdmin, async (req, res) => {
  const gameId = Number(req.params.id);
  const { homeScore, awayScore } = req.body;
  const isClearingResult = homeScore === '' && awayScore === '';
  const isDevelopment =
    process.env.VITE_ENV === 'development' ||
    process.env.NODE_ENV === 'development';

  if (!isClearingResult && (
      homeScore == null || awayScore == null ||
      !Number.isInteger(Number(homeScore)) || !Number.isInteger(Number(awayScore))
  )) {
    return res.status(400).json({ message: 'homeScore and awayScore must be integers.' });
  }

  const games = await query('SELECT id, starts_at FROM wc_games WHERE id = ? LIMIT 1', [gameId]);
  if (!games.length) return res.status(404).json({ message: 'Game not found.' });

  if (!isDevelopment && new Date(games[0].starts_at) > new Date()) {
    return res.status(409).json({ message: 'Cannot set result before the game has started.' });
  }

  const preds = await query(
    'SELECT id, home_score, away_score FROM predictions WHERE game_id = ?',
    [gameId]
  );

  if (isClearingResult) {
    await query(
      'UPDATE wc_games SET actual_home = NULL, actual_away = NULL WHERE id = ?',
      [gameId]
    );

    for (const p of preds) {
      await query('UPDATE predictions SET points = NULL WHERE id = ?', [p.id]);
    }

    return res.json({ message: `Result cleared. ${preds.length} prediction(s) reset.` });
  }

  const actual = { home: Number(homeScore), away: Number(awayScore) };

  await query(
    'UPDATE wc_games SET actual_home = ?, actual_away = ? WHERE id = ?',
    [actual.home, actual.away, gameId]
  );

  function calcPoints(predHome, predAway) {
    const pH = Number(predHome), pA = Number(predAway);
    if (pH === actual.home && pA === actual.away) return 3;
    const actualOutcome = Math.sign(actual.home - actual.away);
    const predOutcome   = Math.sign(pH - pA);
    return actualOutcome === predOutcome ? 1 : 0;
  }

  for (const p of preds) {
    await query('UPDATE predictions SET points = ? WHERE id = ?', [calcPoints(p.home_score, p.away_score), p.id]);
  }

  return res.json({ message: `Result recorded. ${preds.length} prediction(s) scored.` });
});

export default router;
