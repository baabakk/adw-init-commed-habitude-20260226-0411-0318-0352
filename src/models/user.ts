import { query, queryOne, execute } from '../database';

export interface User {
  id: number;
  username: string;
  email?: string;
  phone_number?: string;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  phone_number?: string;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  timezone?: string;
}

export interface UpdateUserData {
  email?: string;
  phone_number?: string;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  timezone?: string;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    // Validate phone number if provided
    if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
      throw new Error('Invalid phone number format');
    }

    const result = await execute(
      `INSERT INTO users (username, email, phone_number, telegram_chat_id, whatsapp_number, timezone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.username,
        data.email || null,
        data.phone_number || null,
        data.telegram_chat_id || null,
        data.whatsapp_number || null,
        data.timezone || 'UTC',
      ]
    );

    const user = await this.findById(result.lastID);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  static async findById(id: number): Promise<User | undefined> {
    return queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    return queryOne<User>('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async findByTelegramChatId(chatId: string): Promise<User | undefined> {
    return queryOne<User>('SELECT * FROM users WHERE telegram_chat_id = ?', [chatId]);
  }

  static async findAll(): Promise<User[]> {
    return query<User>('SELECT * FROM users ORDER BY created_at DESC');
  }

  static async update(id: number, data: UpdateUserData): Promise<User> {
    // Validate phone number if provided
    if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
      throw new Error('Invalid phone number format');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.phone_number !== undefined) {
      updates.push('phone_number = ?');
      values.push(data.phone_number);
    }
    if (data.telegram_chat_id !== undefined) {
      updates.push('telegram_chat_id = ?');
      values.push(data.telegram_chat_id);
    }
    if (data.whatsapp_number !== undefined) {
      updates.push('whatsapp_number = ?');
      values.push(data.whatsapp_number);
    }
    if (data.timezone !== undefined) {
      updates.push('timezone = ?');
      values.push(data.timezone);
    }

    updates.push("updated_at = datetime('now', 'utc')");
    values.push(id);

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found after update');
    }

    return user;
  }

  static async delete(id: number): Promise<void> {
    await execute('DELETE FROM users WHERE id = ?', [id]);
  }

  static async getMessagingPreferences(userId: number): Promise<{
    phone_number?: string;
    telegram_chat_id?: string;
    whatsapp_number?: string;
  }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      phone_number: user.phone_number || undefined,
      telegram_chat_id: user.telegram_chat_id || undefined,
      whatsapp_number: user.whatsapp_number || undefined,
    };
  }

  static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation: +[country code][number]
    // Should start with + and contain 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  static isValidTelegramChatId(chatId: string): boolean {
    // Telegram chat IDs are numeric strings (can be negative for groups)
    return /^-?\d+$/.test(chatId);
  }

  static async getUserTimezone(userId: number): Promise<string> {
    const user = await this.findById(userId);
    return user?.timezone || 'UTC';
  }
}
