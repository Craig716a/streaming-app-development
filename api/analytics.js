import crypto from 'node:crypto';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ADMIN_USER = 'rebelstream';
const COOKIE = 'rebel_admin';

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS stream_analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    title_id TEXT,
    title_name TEXT,
    media_type TEXT,
    season_number INTEGER,
    episode_number INTEGER,
    seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query('CREATE INDEX IF NOT EXISTS stream_analytics_created_idx ON stream_analytics_events (created_at)');
  await pool.query('ALTER TABLE stream_analytics_events ADD COLUMN IF NOT EXISTS country_code TEXT');
  await pool.query('ALTER TABLE stream_analytics_events ADD COLUMN IF NOT EXISTS city TEXT');
  await pool.query('CREATE INDEX IF NOT EXISTS stream_analytics_title_idx ON stream_analytics_events (title_id, created_at)');
}

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  Object.entries({ 'content-type': 'application/json', ...headers }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || '{}');
}

function token() {
  const value = `${ADMIN_USER}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', process.env.BETTER_AUTH_SECRET).update(value).digest('hex');
  return Buffer.from(`${value}:${signature}`).toString('base64url');
}

function isAdmin(req) {
  const raw = req.headers?.cookie || '';
  const match = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  if (!match) return false;
  const decoded = Buffer.from(match.slice(COOKIE.length + 1), 'base64url').toString();
  const [user, timestamp, signature] = decoded.split(':');
  if (user !== ADMIN_USER || !timestamp || !signature || Date.now() - Number(timestamp) > 1000 * 60 * 60 * 24 * 7) return false;
  const expected = crypto.createHmac('sha256', process.env.BETTER_AUTH_SECRET).update(`${user}:${timestamp}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function rangeStart(range) {
  const days = { day: 1, week: 7, month: 30, year: 365, all: 36500 }[range] || 7;
  return new Date(Date.now() - days * 86400000);
}

export default async function handler(req, res) {
  try {
    await ensureSchema();
    const input = await body(req);
    if (input.action === 'event') {
      if (!input.visitorId || input.visitorId === 'anonymous') return send(res, 400, { error: 'Missing visitor identifier' });
      if (input.eventType === 'visit') {
        const existing = await pool.query(`SELECT 1 FROM stream_analytics_events WHERE event_type = 'visit' AND visitor_id = $1 AND created_at >= CURRENT_DATE LIMIT 1`, [input.visitorId]);
        if (existing.rowCount > 0) return send(res, 200, { ok: true, duplicate: true });
      }
      const country = req.headers?.['x-vercel-ip-country'] || req.headers?.['x-country'] || 'Unknown';
      const city = req.headers?.['x-vercel-ip-city'] || null;
      await pool.query(`INSERT INTO stream_analytics_events (event_type, visitor_id, title_id, title_name, media_type, season_number, episode_number, seconds, country_code, city)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [input.eventType || 'visit', input.visitorId, input.titleId || null, input.titleName || null, input.mediaType || null, input.seasonNumber || null, input.episodeNumber || null, Math.max(0, Number(input.seconds) || 0), country, city]);
      return send(res, 200, { ok: true });
    }
    if (input.action === 'login') {
      if (input.username !== ADMIN_USER || input.password !== process.env.ADMIN_PASSWORD) return send(res, 401, { error: 'Invalid credentials' });
      return send(res, 200, { ok: true }, { 'set-cookie': `${COOKIE}=${token()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` });
    }
    if (input.action === 'reset') {
      if (!isAdmin(req) || input.confirmation !== 'RESET_ANALYTICS') return send(res, 401, { error: 'Unauthorized' });
      await pool.query('TRUNCATE TABLE stream_analytics_events RESTART IDENTITY');
      return send(res, 200, { ok: true });
    }
    if (input.action === 'metrics') {
      if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' });
      const start = rangeStart(input.range);
      const params = [start];
      const totals = await pool.query(`SELECT COUNT(*) FILTER (WHERE event_type = 'visit')::int AS visits, COUNT(DISTINCT visitor_id)::int AS unique_users, COALESCE((SELECT SUM(max_seconds) FROM (SELECT visitor_id, title_id, season_number, episode_number, MAX(seconds)::int AS max_seconds FROM stream_analytics_events WHERE event_type = 'progress' AND created_at >= $1 GROUP BY visitor_id, title_id, season_number, episode_number) watched), 0)::int AS seconds FROM stream_analytics_events WHERE created_at >= $1`, params);
      const top = await pool.query(`SELECT title_id AS id, MAX(title_name) AS title, COUNT(*) FILTER (WHERE event_type = 'watch')::int AS watches, COALESCE(SUM(seconds) FILTER (WHERE event_type = 'progress'),0)::int AS seconds FROM stream_analytics_events WHERE created_at >= $1 AND title_id IS NOT NULL GROUP BY title_id ORDER BY watches DESC, seconds DESC LIMIT 10`, params);
      const locations = await pool.query(`SELECT COALESCE(country_code, 'Unknown') AS country, COUNT(DISTINCT visitor_id)::int AS users FROM stream_analytics_events WHERE event_type = 'visit' AND created_at >= $1 GROUP BY country_code ORDER BY users DESC`, params);
      const totalUsers = locations.rows.reduce((sum, row) => sum + row.users, 0);
      return send(res, 200, { ...totals.rows[0], hours: Math.round(Number(totals.rows[0].seconds) / 3600 * 10) / 10, top: top.rows, locations: locations.rows.map((row) => ({ ...row, percentage: totalUsers ? Math.round(row.users / totalUsers * 1000) / 10 : 0 })) });
    }
    return send(res, 400, { error: 'Unknown action' });
  } catch (error) {
    console.error('[analytics]', error);
    return send(res, 500, { error: 'Analytics unavailable' });
  }
}
