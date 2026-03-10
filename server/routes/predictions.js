import express from 'express';
import { attachOptionalAuth, requireAuth } from '../auth.js';
import { query } from '../db.js';

const router = express.Router();

// GET /api/predictions/games
// Returns all 72 fixtures; includes the authenticated user's prediction on each game (if any).
router.get('/games', attachOptionalAuth, async (req, res) => {
  const games = await query(
    `SELECT id, match_number, group_name, stage, home_team, away_team, starts_at, venue, city
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
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      startsAt: g.starts_at,
      venue: g.venue,
      city: g.city,
      prediction: predictionMap[Number(g.id)] ?? null
    }))
  });
});

// PUT /api/predictions/games/:id
// Upsert a score prediction for a fixture. Game must not have started yet.
router.put('/games/:id', requireAuth, async (req, res) => {
  const gameId = Number(req.params.id);
  const { homeScore, awayScore } = req.body;

  if (!gameId) {
    return res.status(400).json({ message: 'Invalid game id.' });
  }

  if (homeScore == null || awayScore == null || !Number.isInteger(Number(homeScore)) || !Number.isInteger(Number(awayScore))) {
    return res.status(400).json({ message: 'homeScore and awayScore must be integers.' });
  }

  const home = Number(homeScore);
  const away = Number(awayScore);

  if (home < 0 || home > 20 || away < 0 || away > 20) {
    return res.status(400).json({ message: 'Scores must be between 0 and 20.' });
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

  await query(
    `INSERT INTO predictions (user_id, game_id, home_score, away_score)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE home_score = VALUES(home_score), away_score = VALUES(away_score)`,
    [req.user.id, gameId, home, away]
  );

  return res.json({ message: 'Prediction saved.' });
});

export default router;
