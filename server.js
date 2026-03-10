import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ensureSchema } from './server/db.js';
import authRoutes from './server/routes/auth.js';
import userRoutes from './server/routes/users.js';
import tradeRoutes from './server/routes/trades.js';
import meetupRoutes from './server/routes/meetups.js';

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

async function bootstrap() {
  await ensureSchema();

  app.listen(port, () => {
    console.log(`Stickermania listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
