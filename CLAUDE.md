# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (run both in parallel terminals)
npm run dev          # Vite frontend dev server (port 5173 with HMR)
npm run server:dev   # Express backend with nodemon (port 3000)

# Production
npm run build        # Vite build to dist/
npm start            # Build + run Express (serves frontend as SPA)

# Database
# Schema is auto-initialized from server/sql/schema.sql on server start
# World Cup games are seeded from server/data/games.js on server start
```

## Architecture

Full-stack SPA: Vue 3 frontend (Vite) + Express backend, sharing a single Node.js project.

**Frontend** (`src/`)
- `App.vue` — Monolithic ~1200-line component. All routing is done via reactive state (no Vue Router). All UI sections, forms, and state live here.
- `api.js` — Axios instance with `baseURL: /api` and `withCredentials: true`
- `translations.js` — vue-i18n messages for EN/DE/SR locales
- `styles.css` — CSS custom properties + all styles

**Backend** (`server/`)
- `server.js` — Entry point; mounts routes, seeds DB, serves `dist/` as SPA fallback
- `db.js` — MariaDB connection pool; exports `query()` and `transaction()` helpers
- `auth.js` — JWT creation, `requireAuth` middleware, `attachOptionalAuth` middleware (cookie-based sessions, 7-day expiry)
- `routes/` — One file per domain: `auth`, `users`, `trades`, `meetups`, `predictions`
- `data/games.js` — All 72 FIFA World Cup 2026 fixtures (seeded into `wc_games` table)
- `sql/schema.sql` — Authoritative DB schema; loaded and executed on startup

**API routes** (all under `/api/`): `auth`, `users`, `trades`, `meetups`, `predictions`

**Key DB tables**: `users`, `user_stickers` (needed/offered), `trade_requests`, `meetups`, `meetup_attendees`, `wc_games`, `predictions`, `verification_tokens`

## Environment

Copy `.env.example` to `.env`. Required vars: `JWT_SECRET`, `DB_*` (MariaDB), `RESEND_API_KEY` (email — mailer gracefully falls back in dev if unconfigured).

Vite dev server proxies `/api/*` to `localhost:3000` (configured in `vite.config.js`).
