"use strict";
/**
 * Abstraction layer for multi-channel messaging (SMS, Telegram, WhatsApp)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingService = exports.MessagingService = void 0;
const smsProvider_1 = require("./smsProvider");
const telegramProvider_1 = require("./telegramProvider");
const whatsappProvider_1 = require("./whatsappProvider");
const database_1 = require("./database");
class MessagingService {
    /**
     * Send notification through specified channels
     */
    async sendNotification(payload) {
        const user = await (0, database_1.getUser)(payload.userId);
        if (!user) {
            return {
                success: false,
                results: [{ channel: 'all', success: false, error: 'User not found' }]
            };
        }
        const results = [];
        // Send through each requested channel
        for (const channel of payload.channels) {
            try {
                switch (channel) {
                    case 'sms':
                        if (user.phoneNumber) {
                            await smsProvider_1.smsProvider.sendSMS(user.phoneNumber, payload.message);
                            results.push({ channel: 'sms', success: true });
                        }
                        else {
                            results.push({ channel: 'sms', success: false, error: 'No phone number configured' });
                        }
                        break;
                    case 'telegram':
                        if (user.telegramId) {
                            await telegramProvider_1.telegramProvider.sendMessage(user.telegramId, payload.message);
                            results.push({ channel: 'telegram', success: true });
                        }
                        else {
                            results.push({ channel: 'telegram', success: false, error: 'No Telegram ID configured' });
                        }
                        break;
                    case 'whatsapp':
                        if (user.whatsappNumber) {
                            await whatsappProvider_1.whatsappProvider.sendMessage(user.whatsappNumber, payload.message);
                            results.push({ channel: 'whatsapp', success: true });
                        }
                        else {
                            results.push({ channel: 'whatsapp', success: false, error: 'No WhatsApp number configured' });
                        }
                        break;
                    default:
                        results.push({ channel, success: false, error: 'Unknown channel' });
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({ channel, success: false, error: errorMessage });
                console.error(`Failed to send ${channel} notification:`, error);
            }
        }
        const allSuccessful = results.every(r => r.success);
        return {
            success: allSuccessful,
            results
        };
    }
    /**
     * Send habit reminder
     */
    async sendHabitReminder(userId, habitId, habitName, channels) {
        const message = `⏰ Reminder: Time to complete your habit "${habitName}"! Keep up the great work! 💪`;
        const payload = {
            userId,
            habitId,
            habitName,
            message,
            channels
        };
        const result = await this.sendNotification(payload);
        if (!result.success) {
            console.warn(`Some reminders failed to send for habit ${habitId}:`, result.results);
        }
    }
    /**
     * Send streak milestone notification
     */
    async sendStreakNotification(userId, habitId, habitName, streakCount, channels) {
        const message = `🎉 Congratulations! You've maintained a ${streakCount}-day streak for "${habitName}"! Keep it going! 🔥`;
        const payload = {
            userId,
            habitId,
            habitName,
            message,
            channels
        };
        await this.sendNotification(payload);
    }
    /**
     * Test connectivity for all messaging providers
     */
    async testConnectivity() {
        return {
            sms: await smsProvider_1.smsProvider.testConnection(),
            telegram: await telegramProvider_1.telegramProvider.testConnection(),
            whatsapp: await whatsappProvider_1.whatsappProvider.testConnection()
        };
    }
    /**
     * Validate user has at least one messaging channel configured
     */
    async validateUserChannels(userId) {
        const user = await (0, database_1.getUser)(userId);
        if (!user) {
            return { valid: false, availableChannels: [] };
        }
        const availableChannels = [];
        if (user.phoneNumber) {
            availableChannels.push('sms');
        }
        if (user.telegramId) {
            availableChannels.push('telegram');
        }
        if (user.whatsappNumber) {
            availableChannels.push('whatsapp');
        }
        return {
            valid: availableChannels.length > 0,
            availableChannels
        };
    }
}
exports.MessagingService = MessagingService;
exports.messagingService = new MessagingService();
