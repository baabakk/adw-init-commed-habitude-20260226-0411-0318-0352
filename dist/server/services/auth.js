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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = generateVerificationCode;
exports.generateSessionToken = generateSessionToken;
exports.initiateSignup = initiateSignup;
exports.verifyCode = verifyCode;
exports.validateSession = validateSession;
exports.destroySession = destroySession;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
const userModel = __importStar(require("../models/user"));
// In-memory session store (for POC - use Redis in production)
const sessions = new Map();
function generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
}
function generateSessionToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
async function initiateSignup(messagingChannel, channelIdentifier, timezone) {
    // Check if user already exists
    const existingUser = await userModel.findUserByChannelIdentifier(channelIdentifier);
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + config_1.default.verification.expirationMinutes * 60 * 1000);
    if (existingUser) {
        // Update verification code for existing user
        await userModel.updateVerificationCode(existingUser.id, code, expiresAt);
        return { user: existingUser, code };
    }
    else {
        // Create new user
        const user = await userModel.createUser({
            messaging_channel: messagingChannel,
            channel_identifier: channelIdentifier,
            timezone,
            verification_code: code,
            verification_code_expires_at: expiresAt,
        });
        return { user, code };
    }
}
async function verifyCode(channelIdentifier, code) {
    const user = await userModel.findUserByChannelIdentifier(channelIdentifier);
    if (!user) {
        return { success: false, error: 'User not found' };
    }
    const isValid = await userModel.checkVerificationCode(user.id, code);
    if (!isValid) {
        return { success: false, error: 'Invalid or expired verification code' };
    }
    // Mark user as verified
    await userModel.verifyUser(user.id);
    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + config_1.default.session.expirationHours * 60 * 60 * 1000);
    sessions.set(token, {
        userId: user.id,
        channelIdentifier: user.channel_identifier,
        expiresAt,
    });
    return { success: true, token, userId: user.id };
}
function validateSession(token) {
    const session = sessions.get(token);
    if (!session) {
        return null;
    }
    if (session.expiresAt < new Date()) {
        sessions.delete(token);
        return null;
    }
    return session;
}
function destroySession(token) {
    sessions.delete(token);
}
function cleanupExpiredSessions() {
    const now = new Date();
    for (const [token, session] of sessions.entries()) {
        if (session.expiresAt < now) {
            sessions.delete(token);
        }
    }
}
// Cleanup expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
exports.default = {
    generateVerificationCode,
    generateSessionToken,
    initiateSignup,
    verifyCode,
    validateSession,
    destroySession,
    cleanupExpiredSessions,
};
//# sourceMappingURL=auth.js.map