import { query } from '../database';

export type MessagingChannel = 'sms' | 'telegram' | 'whatsapp';

export interface User {
  id: number;
  messaging_channel: MessagingChannel;
  channel_identifier: string;
  timezone: string;
  verification_code?: string;
  verification_code_expires_at?: Date;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  messaging_channel: MessagingChannel;
  channel_identifier: string;
  timezone: string;
  verification_code: string;
  verification_code_expires_at: Date;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const result = await query(
    `INSERT INTO users (messaging_channel, channel_identifier, timezone, verification_code, verification_code_expires_at, is_verified)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING *`,
    [
      data.messaging_channel,
      data.channel_identifier,
      data.timezone,
      data.verification_code,
      data.verification_code_expires_at,
    ]
  );
  return result.rows[0];
}

export async function findUserByChannelIdentifier(channel_identifier: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE channel_identifier = $1',
    [channel_identifier]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function updateVerificationCode(
  userId: number,
  code: string,
  expiresAt: Date
): Promise<void> {
  await query(
    'UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3',
    [code, expiresAt, userId]
  );
}

export async function verifyUser(userId: number): Promise<void> {
  await query(
    'UPDATE users SET is_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1',
    [userId]
  );
}

export async function checkVerificationCode(
  userId: number,
  code: string
): Promise<boolean> {
  const result = await query(
    `SELECT * FROM users 
     WHERE id = $1 
     AND verification_code = $2 
     AND verification_code_expires_at > NOW()`,
    [userId, code]
  );
  return result.rows.length > 0;
}

export default {
  createUser,
  findUserByChannelIdentifier,
  findUserById,
  updateVerificationCode,
  verifyUser,
  checkVerificationCode,
};
