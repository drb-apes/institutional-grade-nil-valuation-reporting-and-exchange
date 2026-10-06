import type { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.userId = decoded.sub;
    req.token = token;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      req.userId = decoded.sub;
      req.token = token;
    } catch {
      // invalid token ignored in optional mode
    }
  }

  next();
}
