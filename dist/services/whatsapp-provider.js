"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const database_1 = require("../database");
class WhatsAppProvider {
    constructor() {
        this.client = null;
        this.enabled = config_1.default.whatsapp.enabled;
        if (this.enabled && config_1.default.whatsapp.apiKey && config_1.default.whatsapp.phoneNumberId) {
            try {
                this.client = axios_1.default.create({
                    baseURL: config_1.default.whatsapp.apiUrl,
                    headers: {
                        'Authorization': `Bearer ${config_1.default.whatsapp.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('WhatsApp provider initialized');
            }
            catch (error) {
                console.error('Failed to initialize WhatsApp client:', error);
                this.enabled = false;
            }
        }
        else {
            console.log('WhatsApp provider disabled or not configured');
        }
    }
    async sendMessage(phoneNumber, message, userId, habitId) {
        if (!this.enabled || !this.client) {
            return {
                success: false,
                error: 'WhatsApp provider not enabled or configured',
                attemptCount: 0,
            };
        }
        // Check rate limits
        const canSend = await this.checkRateLimit();
        if (!canSend) {
            await this.logDelivery(userId, habitId, phoneNumber, message, 'rate_limited', 0, 'Rate limit exceeded');
            return {
                success: false,
                error: 'Rate limit exceeded',
                attemptCount: 0,
            };
        }
        // Attempt delivery with retry logic
        let attemptCount = 0;
        let lastError;
        for (let i = 0; i < config_1.default.retry.maxAttempts; i++) {
            attemptCount++;
            try {
                const response = await this.client.post(`/${config_1.default.whatsapp.phoneNumberId}/messages`, {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: {
                        body: message,
                    },
                });
                // Log successful delivery
                await this.logDelivery(userId, habitId, phoneNumber, message, 'sent', attemptCount);
                await this.incrementRateLimit();
                return {
                    success: true,
                    messageId: response.data.messages?.[0]?.id,
                    attemptCount,
                };
            }
            catch (error) {
                lastError = error.response?.data?.error?.message || error.message || 'Unknown error';
                console.error(`WhatsApp delivery attempt ${attemptCount} failed:`, error.response?.data || error.message);
                // Don't retry on certain errors
                if (error.response?.status === 400 || error.response?.status === 403) {
                    // Invalid phone number or permission denied
                    await this.logDelivery(userId, habitId, phoneNumber, message, 'failed', attemptCount, lastError);
                    return {
                        success: false,
                        error: lastError,
                        attemptCount,
                    };
                }
                // Wait before retry with exponential backoff
                if (i < config_1.default.retry.maxAttempts - 1) {
                    const delay = Math.min(config_1.default.retry.initialDelayMs * Math.pow(2, i), config_1.default.retry.maxDelayMs);
                    await this.sleep(delay);
                }
            }
        }
        // All attempts failed
        await this.logDelivery(userId, habitId, phoneNumber, message, 'failed', attemptCount, lastError);
        return {
            success: false,
            error: lastError || 'All delivery attempts failed',
            attemptCount,
        };
    }
    async checkRateLimit() {
        const now = new Date();
        const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).toISOString();
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();
        // Check minute limit
        const minuteCount = await (0, database_1.query)(`SELECT message_count FROM rate_limit_tracking 
       WHERE channel = 'whatsapp' AND window_type = 'minute' AND window_start = ?`, [minuteStart]);
        if (minuteCount.length > 0 && minuteCount[0].message_count >= config_1.default.rateLimits.whatsapp.maxPerMinute) {
            return false;
        }
        // Check hour limit
        const hourCount = await (0, database_1.query)(`SELECT message_count FROM rate_limit_tracking 
       WHERE channel = 'whatsapp' AND window_type = 'hour' AND window_start = ?`, [hourStart]);
        if (hourCount.length > 0 && hourCount[0].message_count >= config_1.default.rateLimits.whatsapp.maxPerHour) {
            return false;
        }
        return true;
    }
    async incrementRateLimit() {
        const now = new Date();
        const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).toISOString();
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();
        // Increment minute counter
        await (0, database_1.execute)(`INSERT INTO rate_limit_tracking (channel, window_start, window_type, message_count)
       VALUES ('whatsapp', ?, 'minute', 1)
       ON CONFLICT(channel, window_start, window_type) 
       DO UPDATE SET message_count = message_count + 1`, [minuteStart]);
        // Increment hour counter
        await (0, database_1.execute)(`INSERT INTO rate_limit_tracking (channel, window_start, window_type, message_count)
       VALUES ('whatsapp', ?, 'hour', 1)
       ON CONFLICT(channel, window_start, window_type) 
       DO UPDATE SET message_count = message_count + 1`, [hourStart]);
    }
    async logDelivery(userId, habitId, recipient, message, status, attemptCount, errorMessage) {
        await (0, database_1.execute)(`INSERT INTO message_delivery_log (user_id, habit_id, channel, recipient, message, status, attempt_count, error_message)
       VALUES (?, ?, 'whatsapp', ?, ?, ?, ?, ?)`, [userId, habitId || null, recipient, message, status, attemptCount, errorMessage || null]);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    isEnabled() {
        return this.enabled;
    }
}
exports.WhatsAppProvider = WhatsAppProvider;
