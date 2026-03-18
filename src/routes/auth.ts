import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Helper to load RSA keys from env (PEM format)
const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
if (!PRIVATE_KEY || !PUBLIC_KEY) {
  console.warn('JWT keys not set in environment; authentication will fail.');
}

// Simple user lookup – in real app, password hashing & verification needed
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const result = await query<{ id: number; email: string; password: string }>(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, PRIVATE_KEY!, { algorithm: 'RS256', expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, PRIVATE_KEY!, { algorithm: 'RS256', expiresIn: '7d' });
    res.json({ token, refreshToken });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, PUBLIC_KEY!) as jwt.JwtPayload;
    const payload = { sub: decoded.sub, email: decoded.email };
    const newToken = jwt.sign(payload, PRIVATE_KEY!, { algorithm: 'RS256', expiresIn: '15m' });
    res.json({ token: newToken });
  } catch (err) {
    console.warn('Refresh token invalid', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Middleware to protect routes
export const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, PUBLIC_KEY!) as jwt.JwtPayload;
    // attach user info to request
    (req as any).user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    console.warn('Auth token invalid', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email });
});

export default router;
