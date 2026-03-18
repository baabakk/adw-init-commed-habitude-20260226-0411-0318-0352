"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const sms_provider_1 = require("./sms-provider");
const telegram_provider_1 = require("./telegram-provider");
const whatsapp_provider_1 = require("./whatsapp-provider");
const user_1 = require("../models/user");
class MessagingGateway {
    constructor() {
        this.smsProvider = new sms_provider_1.SMSProvider();
        this.telegramProvider = new telegram_provider_1.TelegramProvider();
        this.whatsappProvider = new whatsapp_provider_1.WhatsAppProvider();
    }
    async sendMessage(userId, message, channel, habitId) {
        // Get user messaging preferences
        const user = await user_1.UserModel.findById(userId);
        if (!user) {
            return {
                success: false,
                channel,
                error: 'User not found',
                attemptCount: 0,
            };
        }
        try {
            switch (channel) {
                case 'sms':
                    return await this.sendViaSMS(user.phone_number, message, userId, habitId);
                case 'telegram':
                    return await this.sendViaTelegram(user.telegram_chat_id, message, userId, habitId);
                case 'whatsapp':
                    return await this.sendViaWhatsApp(user.whatsapp_number, message, userId, habitId);
                default:
                    return {
                        success: false,
                        channel,
                        error: 'Invalid channel',
                        attemptCount: 0,
                    };
            }
        }
        catch (error) {
            console.error(`Error sending message via ${channel}:`, error);
            return {
                success: false,
                channel,
                error: error.message || 'Unknown error',
                attemptCount: 0,
            };
        }
    }
    async sendMessageWithFallback(userId, message, preferredChannel, habitId) {
        // Try preferred channel first
        const result = await this.sendMessage(userId, message, preferredChannel, habitId);
        if (result.success) {
            return result;
        }
        console.log(`Primary channel ${preferredChannel} failed, attempting fallback`);
        // Try fallback channels
        const fallbackChannels = ['sms', 'telegram', 'whatsapp']
            .filter(ch => ch !== preferredChannel);
        for (const channel of fallbackChannels) {
            const fallbackResult = await this.sendMessage(userId, message, channel, habitId);
            if (fallbackResult.success) {
                console.log(`Successfully delivered via fallback channel: ${channel}`);
                return fallbackResult;
            }
        }
        // All channels failed
        return {
            success: false,
            channel: preferredChannel,
            error: 'All delivery channels failed',
            attemptCount: result.attemptCount,
        };
    }
    async sendViaSMS(phoneNumber, message, userId, habitId) {
        if (!phoneNumber) {
            return {
                success: false,
                channel: 'sms',
                error: 'Phone number not configured',
                attemptCount: 0,
            };
        }
        if (!this.smsProvider.isEnabled()) {
            return {
                success: false,
                channel: 'sms',
                error: 'SMS provider not enabled',
                attemptCount: 0,
            };
        }
        const result = await this.smsProvider.sendSMS(phoneNumber, message, userId, habitId);
        return {
            success: result.success,
            channel: 'sms',
            messageId: result.messageId,
            error: result.error,
            attemptCount: result.attemptCount,
        };
    }
    async sendViaTelegram(chatId, message, userId, habitId) {
        if (!chatId) {
            return {
                success: false,
                channel: 'telegram',
                error: 'Telegram chat ID not configured',
                attemptCount: 0,
            };
        }
        if (!this.telegramProvider.isEnabled()) {
            return {
                success: false,
                channel: 'telegram',
                error: 'Telegram provider not enabled',
                attemptCount: 0,
            };
        }
        const result = await this.telegramProvider.sendMessage(chatId, message, userId, habitId);
        return {
            success: result.success,
            channel: 'telegram',
            messageId: result.messageId,
            error: result.error,
            attemptCount: result.attemptCount,
        };
    }
    async sendViaWhatsApp(phoneNumber, message, userId, habitId) {
        if (!phoneNumber) {
            return {
                success: false,
                channel: 'whatsapp',
                error: 'WhatsApp number not configured',
                attemptCount: 0,
            };
        }
        if (!this.whatsappProvider.isEnabled()) {
            return {
                success: false,
                channel: 'whatsapp',
                error: 'WhatsApp provider not enabled',
                attemptCount: 0,
            };
        }
        const result = await this.whatsappProvider.sendMessage(phoneNumber, message, userId, habitId);
        return {
            success: result.success,
            channel: 'whatsapp',
            messageId: result.messageId,
            error: result.error,
            attemptCount: result.attemptCount,
        };
    }
    getAvailableChannels() {
        const channels = [];
        if (this.smsProvider.isEnabled()) {
            channels.push('sms');
        }
        if (this.telegramProvider.isEnabled()) {
            channels.push('telegram');
        }
        if (this.whatsappProvider.isEnabled()) {
            channels.push('whatsapp');
        }
        return channels;
    }
    async startPolling() {
        await this.telegramProvider.startPolling();
    }
    async stopPolling() {
        await this.telegramProvider.stopPolling();
    }
}
exports.MessagingGateway = MessagingGateway;
