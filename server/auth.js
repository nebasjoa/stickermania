import jwt from 'jsonwebtoken';

const cookieName = 'stickermania_token';

export function createAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
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
