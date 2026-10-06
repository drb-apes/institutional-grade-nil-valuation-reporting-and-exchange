import type { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
}

/**
 * JWT authentication middleware.
 * Extracts and validates bearer token from Authorization header.
 */
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

  // TODO: Verify JWT with your secret
  // For now, just extract user ID from a mock payload
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.userId = decoded.sub;
    req.token = token;
    next();
  } catch {n    res.status(403).json({ error: 'Invalid token' });
  }
}

/**
 * Optional authentication: sets userId if token present, otherwise continues.
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
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
      // Token invalid, continue without auth
    }
  }

  next();
}
