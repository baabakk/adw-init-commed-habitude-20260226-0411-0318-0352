"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../database");
class UserModel {
    static async create(data) {
        // Validate phone number if provided
        if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }
        const result = await (0, database_1.execute)(`INSERT INTO users (username, email, phone_number, telegram_chat_id, whatsapp_number, timezone)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            data.username,
            data.email || null,
            data.phone_number || null,
            data.telegram_chat_id || null,
            data.whatsapp_number || null,
            data.timezone || 'UTC',
        ]);
        const user = await this.findById(result.lastID);
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    }
    static async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM users WHERE id = ?', [id]);
    }
    static async findByUsername(username) {
        return (0, database_1.queryOne)('SELECT * FROM users WHERE username = ?', [username]);
    }
    static async findByTelegramChatId(chatId) {
        return (0, database_1.queryOne)('SELECT * FROM users WHERE telegram_chat_id = ?', [chatId]);
    }
    static async findAll() {
        return (0, database_1.query)('SELECT * FROM users ORDER BY created_at DESC');
    }
    static async update(id, data) {
        // Validate phone number if provided
        if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }
        const updates = [];
        const values = [];
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
        await (0, database_1.execute)(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found after update');
        }
        return user;
    }
    static async delete(id) {
        await (0, database_1.execute)('DELETE FROM users WHERE id = ?', [id]);
    }
    static async getMessagingPreferences(userId) {
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
    static isValidPhoneNumber(phoneNumber) {
        // Basic E.164 format validation: +[country code][number]
        // Should start with + and contain 10-15 digits
        const phoneRegex = /^\+[1-9]\d{9,14}$/;
        return phoneRegex.test(phoneNumber);
    }
    static isValidTelegramChatId(chatId) {
        // Telegram chat IDs are numeric strings (can be negative for groups)
        return /^-?\d+$/.test(chatId);
    }
    static async getUserTimezone(userId) {
        const user = await this.findById(userId);
        return user?.timezone || 'UTC';
    }
}
exports.UserModel = UserModel;
