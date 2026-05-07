import { articles } from '../../src/data/news.js';
import { query } from '../db.js';

const BASE_URL = (process.env.BASE_URL || 'https://worldcupstuff.com').replace(/\/$/, '');

const today = () => new Date().toISOString().slice(0, 10);

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

export default async function sitemapHandler(_req, res) {
  const meetups = await query(
    'SELECT id, created_at FROM meetups ORDER BY created_at DESC'
  );

  const t = today();

  const staticEntries = [
    urlEntry('/',                        t,            'daily',   '1.0'),
    urlEntry('/search',                  t,            'daily',   '0.9'),
    urlEntry('/meetups',                 t,            'daily',   '0.8'),
    urlEntry('/predictions',             t,            'daily',   '0.8'),
    urlEntry('/predictions/leaderboard', t,            'daily',   '0.7'),
    urlEntry('/news',                    t,            'weekly',  '0.8'),
    urlEntry('/login',                   '2026-04-21', 'monthly', '0.5'),
    urlEntry('/register',                '2026-04-21', 'monthly', '0.5'),
    urlEntry('/terms',                   '2026-04-28', 'monthly', '0.3'),
    urlEntry('/privacy',                 '2026-04-28', 'monthly', '0.3'),
  ];

  const newsEntries = articles.map((a) =>
    urlEntry(`/news/${a.slug}`, a.date, 'monthly', '0.7')
  );

  const meetupEntries = meetups.map((m) =>
    urlEntry(
      `/meetups/${m.id}`,
      new Date(m.created_at).toISOString().slice(0, 10),
      'weekly',
      '0.6'
    )
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...newsEntries,
    ...meetupEntries,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
}
