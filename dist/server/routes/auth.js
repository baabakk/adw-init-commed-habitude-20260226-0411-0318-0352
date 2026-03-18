"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService = __importStar(require("../services/auth"));
const messaging = __importStar(require("../services/messaging"));
const router = (0, express_1.Router)();
// Signup endpoint - initiate verification
router.post('/signup', async (req, res) => {
    try {
        const { messaging_channel, channel_identifier, timezone } = req.body;
        // Validate input
        if (!messaging_channel || !channel_identifier || !timezone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: messaging_channel, channel_identifier, timezone',
            });
        }
        // Validate messaging channel
        const validChannels = ['sms', 'telegram', 'whatsapp'];
        if (!validChannels.includes(messaging_channel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid messaging channel. Must be: sms, telegram, or whatsapp',
            });
        }
        // Initiate signup
        const { user, code } = await authService.initiateSignup(messaging_channel, channel_identifier, timezone);
        // Send verification code
        const message = messaging.formatVerificationMessage(code);
        const sent = await messaging.sendMessage({
            channel: messaging_channel,
            recipient: channel_identifier,
            message,
        });
        if (!sent) {
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification code',
            });
        }
        res.json({
            success: true,
            message: 'Verification code sent',
            userId: user.id,
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Verify code endpoint
router.post('/verify', async (req, res) => {
    try {
        const { channel_identifier, code } = req.body;
        if (!channel_identifier || !code) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: channel_identifier, code',
            });
        }
        const result = await authService.verifyCode(channel_identifier, code);
        if (!result.success) {
            return res.status(401).json(result);
        }
        res.json(result);
    }
    catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Login endpoint - resend verification code
router.post('/login', async (req, res) => {
    try {
        const { channel_identifier } = req.body;
        if (!channel_identifier) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: channel_identifier',
            });
        }
        // Find user and resend code
        const userModel = await Promise.resolve().then(() => __importStar(require('../models/user')));
        const user = await userModel.findUserByChannelIdentifier(channel_identifier);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        // Generate new verification code
        const code = authService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await userModel.updateVerificationCode(user.id, code, expiresAt);
        // Send verification code
        const message = messaging.formatVerificationMessage(code);
        const sent = await messaging.sendMessage({
            channel: user.messaging_channel,
            recipient: user.channel_identifier,
            message,
        });
        if (!sent) {
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification code',
            });
        }
        res.json({
            success: true,
            message: 'Verification code sent',
            userId: user.id,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            authService.destroySession(token);
        }
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
// Session validation endpoint
router.get('/session', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }
        const session = authService.validateSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session',
            });
        }
        res.json({
            success: true,
            userId: session.userId,
        });
    }
    catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map