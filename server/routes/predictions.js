import express from 'express';
import { attachOptionalAuth, requireAdmin, requireAuth } from '../auth.js';
import { query } from '../db.js';

const router = express.Router();

function parseBooleanFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function parseOptionalScore(value) {
  if (value === '' || value == null) return null;
  if (!Number.isInteger(Number(value))) return NaN;
  return Number(value);
}

function validateKnockoutPayload(stage, payload) {
  if (stage === 'group') {
    return {
      extraTimePlayed: false,
      extraHomeScore: null,
      extraAwayScore: null,
      penaltiesPlayed: false,
      penaltiesHomeScore: null,
      penaltiesAwayScore: null,
    };
  }

  const extraTimePlayed = parseBooleanFlag(payload.extraTimePlayed);
  const penaltiesPlayed = parseBooleanFlag(payload.penaltiesPlayed);
  const extraHomeScore = parseOptionalScore(payload.extraHomeScore);
  const extraAwayScore = parseOptionalScore(payload.extraAwayScore);
  const penaltiesHomeScore = parseOptionalScore(payload.penaltiesHomeScore);
  const penaltiesAwayScore = parseOptionalScore(payload.penaltiesAwayScore);

  if (!extraTimePlayed && penaltiesPlayed) {
    return { error: 'Penalty shootouts require extra time.' };
  }

  if (extraTimePlayed && (Number.isNaN(extraHomeScore) || Number.isNaN(extraAwayScore))) {
    return { error: 'extraHomeScore and extraAwayScore must be integers when extra time is selected.' };
  }

  if (!extraTimePlayed && (extraHomeScore != null || extraAwayScore != null)) {
    return { error: 'Extra-time scores can only be set when extra time is selected.' };
  }

  if (penaltiesPlayed && (Number.isNaN(penaltiesHomeScore) || Number.isNaN(penaltiesAwayScore))) {
    return { error: 'penaltiesHomeScore and penaltiesAwayScore must be integers when penalties are selected.' };
  }

  if (!penaltiesPlayed && (penaltiesHomeScore != null || penaltiesAwayScore != null)) {
    return { error: 'Penalty scores can only be set when penalties are selected.' };
  }

  const allScores = [extraHomeScore, extraAwayScore, penaltiesHomeScore, penaltiesAwayScore]
    .filter((value) => value != null);

  if (allScores.some((value) => value < 0 || value > 20)) {
    return { error: 'Knockout scores must be between 0 and 20.' };
  }

  return {
    extraTimePlayed,
    extraHomeScore: extraTimePlayed ? extraHomeScore : null,
    extraAwayScore: extraTimePlayed ? extraAwayScore : null,
    penaltiesPlayed,
    penaltiesHomeScore: penaltiesPlayed ? penaltiesHomeScore : null,
    penaltiesAwayScore: penaltiesPlayed ? penaltiesAwayScore : null,
  };
}

function determineKnockoutOutcome(result) {
  if (result.penaltiesPlayed) {
    return Math.sign(result.penaltiesHomeScore - result.penaltiesAwayScore);
  }
  if (result.extraTimePlayed) {
    return Math.sign(result.extraHomeScore - result.extraAwayScore);
  }
  return Math.sign(result.homeScore - result.awayScore);
}

function calcPredictionPoints(prediction, actual, stage) {
  if (stage === 'group') {
    if (prediction.homeScore === actual.homeScore && prediction.awayScore === actual.awayScore) return 3;
    return Math.sign(prediction.homeScore - prediction.awayScore) === Math.sign(actual.homeScore - actual.awayScore) ? 1 : 0;
  }

  const exact =
    prediction.homeScore === actual.homeScore &&
    prediction.awayScore === actual.awayScore &&
    prediction.extraTimePlayed === actual.extraTimePlayed &&
    prediction.extraHomeScore === actual.extraHomeScore &&
    prediction.extraAwayScore === actual.extraAwayScore &&
    prediction.penaltiesPlayed === actual.penaltiesPlayed &&
    prediction.penaltiesHomeScore === actual.penaltiesHomeScore &&
    prediction.penaltiesAwayScore === actual.penaltiesAwayScore;

  if (exact) return 3;

  return determineKnockoutOutcome(prediction) === determineKnockoutOutcome(actual) ? 1 : 0;
}

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
            actual_home, actual_away, actual_extra_time_played, actual_extra_home, actual_extra_away,
            actual_penalties_played, actual_penalties_home, actual_penalties_away
     FROM wc_games
     ORDER BY starts_at ASC, match_number ASC`
  );

  let userPredictions = [];
  if (req.user?.id) {
    userPredictions = await query(
      `SELECT game_id, home_score, away_score, extra_time_played, extra_home_score, extra_away_score,
              penalties_played, penalties_home_score, penalties_away_score, points
       FROM predictions
       WHERE user_id = ?`,
      [req.user.id]
    );
  }

  const predictionMap = {};
  for (const p of userPredictions) {
    predictionMap[Number(p.game_id)] = {
      homeScore: Number(p.home_score),
      awayScore: Number(p.away_score),
      extraTimePlayed: Boolean(p.extra_time_played),
      extraHomeScore: p.extra_home_score != null ? Number(p.extra_home_score) : null,
      extraAwayScore: p.extra_away_score != null ? Number(p.extra_away_score) : null,
      penaltiesPlayed: Boolean(p.penalties_played),
      penaltiesHomeScore: p.penalties_home_score != null ? Number(p.penalties_home_score) : null,
      penaltiesAwayScore: p.penalties_away_score != null ? Number(p.penalties_away_score) : null,
      points: p.points != null ? Number(p.points) : null
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
      actualExtraTimePlayed: Boolean(g.actual_extra_time_played),
      actualExtraHome: g.actual_extra_home != null ? Number(g.actual_extra_home) : null,
      actualExtraAway: g.actual_extra_away != null ? Number(g.actual_extra_away) : null,
      actualPenaltiesPlayed: Boolean(g.actual_penalties_played),
      actualPenaltiesHome: g.actual_penalties_home != null ? Number(g.actual_penalties_home) : null,
      actualPenaltiesAway: g.actual_penalties_away != null ? Number(g.actual_penalties_away) : null,
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
  const {
    homeScore, awayScore, extraTimePlayed, extraHomeScore, extraAwayScore,
    penaltiesPlayed, penaltiesHomeScore, penaltiesAwayScore
  } = req.body;
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
    'SELECT id, starts_at, stage FROM wc_games WHERE id = ? LIMIT 1',
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
  const game = games[0];
  const knockoutFields = validateKnockoutPayload(game.stage, {
    extraTimePlayed,
    extraHomeScore,
    extraAwayScore,
    penaltiesPlayed,
    penaltiesHomeScore,
    penaltiesAwayScore,
  });

  if (home < 0 || home > 20 || away < 0 || away > 20) {
    return res.status(400).json({ message: 'Scores must be between 0 and 20.' });
  }

  if (knockoutFields.error) {
    return res.status(400).json({ message: knockoutFields.error });
  }

  await query(
    `INSERT INTO predictions (
       user_id, game_id, home_score, away_score, extra_time_played, extra_home_score, extra_away_score,
       penalties_played, penalties_home_score, penalties_away_score
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       home_score = VALUES(home_score),
       away_score = VALUES(away_score),
       extra_time_played = VALUES(extra_time_played),
       extra_home_score = VALUES(extra_home_score),
       extra_away_score = VALUES(extra_away_score),
       penalties_played = VALUES(penalties_played),
       penalties_home_score = VALUES(penalties_home_score),
       penalties_away_score = VALUES(penalties_away_score)`,
    [
      req.user.id,
      gameId,
      home,
      away,
      knockoutFields.extraTimePlayed ? 1 : 0,
      knockoutFields.extraHomeScore,
      knockoutFields.extraAwayScore,
      knockoutFields.penaltiesPlayed ? 1 : 0,
      knockoutFields.penaltiesHomeScore,
      knockoutFields.penaltiesAwayScore
    ]
  );

  return res.json({ message: 'Prediction saved.' });
});

// PUT /api/predictions/games/:id/result
// Record the actual final score for a game and auto-score all predictions for it.
// Points: 3 for exact score, 1 for correct outcome, 0 otherwise.
router.put('/games/:id/result', requireAdmin, async (req, res) => {
  const gameId = Number(req.params.id);
  const {
    homeScore, awayScore, extraTimePlayed, extraHomeScore, extraAwayScore,
    penaltiesPlayed, penaltiesHomeScore, penaltiesAwayScore
  } = req.body;
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

  const games = await query('SELECT id, starts_at, stage FROM wc_games WHERE id = ? LIMIT 1', [gameId]);
  if (!games.length) return res.status(404).json({ message: 'Game not found.' });

  if (!isDevelopment && new Date(games[0].starts_at) > new Date()) {
    return res.status(409).json({ message: 'Cannot set result before the game has started.' });
  }

  const preds = await query(
    `SELECT id, home_score, away_score, extra_time_played, extra_home_score, extra_away_score,
            penalties_played, penalties_home_score, penalties_away_score
     FROM predictions
     WHERE game_id = ?`,
    [gameId]
  );

  if (isClearingResult) {
    await query(
      `UPDATE wc_games
       SET actual_home = NULL, actual_away = NULL,
           actual_extra_time_played = 0, actual_extra_home = NULL, actual_extra_away = NULL,
           actual_penalties_played = 0, actual_penalties_home = NULL, actual_penalties_away = NULL
       WHERE id = ?`,
      [gameId]
    );

    for (const p of preds) {
      await query('UPDATE predictions SET points = NULL WHERE id = ?', [p.id]);
    }

    return res.json({ message: `Result cleared. ${preds.length} prediction(s) reset.` });
  }

  const actual = { homeScore: Number(homeScore), awayScore: Number(awayScore) };
  const knockoutFields = validateKnockoutPayload(games[0].stage, {
    extraTimePlayed,
    extraHomeScore,
    extraAwayScore,
    penaltiesPlayed,
    penaltiesHomeScore,
    penaltiesAwayScore,
  });

  if (actual.homeScore < 0 || actual.homeScore > 20 || actual.awayScore < 0 || actual.awayScore > 20) {
    return res.status(400).json({ message: 'Scores must be between 0 and 20.' });
  }

  if (knockoutFields.error) {
    return res.status(400).json({ message: knockoutFields.error });
  }

  actual.extraTimePlayed = knockoutFields.extraTimePlayed;
  actual.extraHomeScore = knockoutFields.extraHomeScore;
  actual.extraAwayScore = knockoutFields.extraAwayScore;
  actual.penaltiesPlayed = knockoutFields.penaltiesPlayed;
  actual.penaltiesHomeScore = knockoutFields.penaltiesHomeScore;
  actual.penaltiesAwayScore = knockoutFields.penaltiesAwayScore;

  await query(
    `UPDATE wc_games
     SET actual_home = ?, actual_away = ?, actual_extra_time_played = ?, actual_extra_home = ?, actual_extra_away = ?,
         actual_penalties_played = ?, actual_penalties_home = ?, actual_penalties_away = ?
     WHERE id = ?`,
    [
      actual.homeScore,
      actual.awayScore,
      actual.extraTimePlayed ? 1 : 0,
      actual.extraHomeScore,
      actual.extraAwayScore,
      actual.penaltiesPlayed ? 1 : 0,
      actual.penaltiesHomeScore,
      actual.penaltiesAwayScore,
      gameId
    ]
  );

  for (const p of preds) {
    const prediction = {
      homeScore: Number(p.home_score),
      awayScore: Number(p.away_score),
      extraTimePlayed: Boolean(p.extra_time_played),
      extraHomeScore: p.extra_home_score != null ? Number(p.extra_home_score) : null,
      extraAwayScore: p.extra_away_score != null ? Number(p.extra_away_score) : null,
      penaltiesPlayed: Boolean(p.penalties_played),
      penaltiesHomeScore: p.penalties_home_score != null ? Number(p.penalties_home_score) : null,
      penaltiesAwayScore: p.penalties_away_score != null ? Number(p.penalties_away_score) : null,
    };
    await query('UPDATE predictions SET points = ? WHERE id = ?', [calcPredictionPoints(prediction, actual, games[0].stage), p.id]);
  }

  return res.json({ message: `Result recorded. ${preds.length} prediction(s) scored.` });
});

export default router;
