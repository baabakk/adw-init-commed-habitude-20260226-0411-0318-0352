"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Helper to load RSA keys from env (PEM format)
const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
if (!PRIVATE_KEY || !PUBLIC_KEY) {
    console.warn('JWT keys not set in environment; authentication will fail.');
}
// Simple user lookup – in real app, password hashing & verification needed
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const result = await (0, db_1.query)('SELECT id, email, password FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = { sub: user.id, email: user.email };
        const token = jsonwebtoken_1.default.sign(payload, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
        res.json({ token, refreshToken });
    }
    catch (err) {
        console.error('Login error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, PUBLIC_KEY);
        const payload = { sub: decoded.sub, email: decoded.email };
        const newToken = jsonwebtoken_1.default.sign(payload, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' });
        res.json({ token: newToken });
    }
    catch (err) {
        console.warn('Refresh token invalid', err);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
// Middleware to protect routes
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, PUBLIC_KEY);
        // attach user info to request
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch (err) {
        console.warn('Auth token invalid', err);
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
router.get('/me', exports.authenticate, (req, res) => {
    const user = req.user;
    res.json({ id: user.id, email: user.email });
});
exports.default = router;
