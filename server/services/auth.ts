import crypto from 'crypto';
import config from '../config';
import * as userModel from '../models/user';
import { MessagingChannel } from '../models/user';

export interface SessionData {
  userId: number;
  channelIdentifier: string;
  expiresAt: Date;
}

// In-memory session store (for POC - use Redis in production)
const sessions = new Map<string, SessionData>();

export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function initiateSignup(
  messagingChannel: MessagingChannel,
  channelIdentifier: string,
  timezone: string
): Promise<{ user: any; code: string }> {
  // Check if user already exists
  const existingUser = await userModel.findUserByChannelIdentifier(channelIdentifier);
  
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + config.verification.expirationMinutes * 60 * 1000);

  if (existingUser) {
    // Update verification code for existing user
    await userModel.updateVerificationCode(existingUser.id, code, expiresAt);
    return { user: existingUser, code };
  } else {
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

export async function verifyCode(
  channelIdentifier: string,
  code: string
): Promise<{ success: boolean; token?: string; userId?: number; error?: string }> {
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
  const expiresAt = new Date(Date.now() + config.session.expirationHours * 60 * 60 * 1000);
  
  sessions.set(token, {
    userId: user.id,
    channelIdentifier: user.channel_identifier,
    expiresAt,
  });

  return { success: true, token, userId: user.id };
}

export function validateSession(token: string): SessionData | null {
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

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}

// Cleanup expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

export default {
  generateVerificationCode,
  generateSessionToken,
  initiateSignup,
  verifyCode,
  validateSession,
  destroySession,
  cleanupExpiredSessions,
};
