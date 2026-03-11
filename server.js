import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ensureSchema, query } from './server/db.js';
import { games as wcGames } from './server/data/games.js';
import authRoutes from './server/routes/auth.js';
import userRoutes from './server/routes/users.js';
import tradeRoutes from './server/routes/trades.js';
import meetupRoutes from './server/routes/meetups.js';
import predictionRoutes from './server/routes/predictions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const distPath = path.join(__dirname, 'dist');

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/predictions', predictionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(distPath, 'index.html'));
});

async function seedGames() {
  for (const game of wcGames) {
    await query(
      `INSERT INTO wc_games (match_number, group_name, stage, home_team, away_team, starts_at, venue, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         group_name = VALUES(group_name),
         stage = VALUES(stage),
         home_team = VALUES(home_team),
         away_team = VALUES(away_team),
         starts_at = VALUES(starts_at),
         venue = VALUES(venue),
         city = VALUES(city)`,
      [game.matchNumber, game.group, game.stage || 'group', game.homeTeam, game.awayTeam, new Date(game.startsAt), game.venue, game.city]
    );
  }
}

async function bootstrap() {
  await ensureSchema();
  await seedGames();

  app.listen(port, () => {
    console.log(`Stickermania listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
