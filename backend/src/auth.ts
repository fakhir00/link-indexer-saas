import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
  throw new Error('Missing JWT_SECRET environment variable');
}
const JWT_SECRET: jwt.Secret = JWT_SECRET_ENV;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser) {
  const signOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d',
  };

  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, signOptions);
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ error: 'Unauthorized: Token payload is invalid' });
    }

    req.user = {
      id: String(decoded.id),
      email: String(decoded.email),
      role: String(decoded.role),
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
}
