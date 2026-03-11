import jwt from 'jsonwebtoken';
import { query } from './db.js';

const cookieName = 'stickermania_token';

export function createAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: Boolean(user.is_admin)
    },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(res, user) {
  const token = createAuthToken(user);

  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(cookieName);
}

export function requireAuth(req, res, next) {
  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid session.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const users = await query(
        'SELECT is_admin FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      );

      if (!users.length || !users[0].is_admin) {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      req.user.isAdmin = true;
      return next();
    } catch (_error) {
      return res.status(500).json({ message: 'Could not verify admin access.' });
    }
  });
}

export function attachOptionalAuth(req, _res, next) {
  const token = req.cookies[cookieName];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
  } catch (_error) {
    req.user = null;
  }

  return next();
}
