"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.formatVerificationMessage = formatVerificationMessage;
exports.formatReminderMessage = formatReminderMessage;
exports.formatCompletionConfirmation = formatCompletionConfirmation;
exports.formatStreakNotification = formatStreakNotification;
exports.parseCompletionReply = parseCompletionReply;
exports.getTelegramBot = getTelegramBot;
const config_1 = __importDefault(require("../config"));
const twilio_1 = __importDefault(require("twilio"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// Initialize messaging clients
let twilioClient = null;
let telegramBot = null;
if (config_1.default.twilio.accountSid && config_1.default.twilio.authToken) {
    twilioClient = (0, twilio_1.default)(config_1.default.twilio.accountSid, config_1.default.twilio.authToken);
}
if (config_1.default.telegram.botToken) {
    telegramBot = new node_telegram_bot_api_1.default(config_1.default.telegram.botToken, { polling: false });
}
async function sendMessage(params) {
    const { channel, recipient, message } = params;
    try {
        switch (channel) {
            case 'sms':
                return await sendSMS(recipient, message);
            case 'telegram':
                return await sendTelegram(recipient, message);
            case 'whatsapp':
                return await sendWhatsApp(recipient, message);
            default:
                console.error('Unknown messaging channel:', channel);
                return false;
        }
    }
    catch (error) {
        console.error(`Failed to send message via ${channel}:`, error);
        return false;
    }
}
async function sendSMS(phoneNumber, message) {
    if (!twilioClient) {
        console.error('Twilio client not initialized');
        return false;
    }
    try {
        await twilioClient.messages.create({
            body: message,
            from: config_1.default.twilio.phoneNumber,
            to: phoneNumber,
        });
        console.log(`SMS sent to ${phoneNumber}`);
        return true;
    }
    catch (error) {
        console.error('SMS sending failed:', error);
        return false;
    }
}
async function sendTelegram(chatId, message) {
    if (!telegramBot) {
        console.error('Telegram bot not initialized');
        return false;
    }
    try {
        await telegramBot.sendMessage(chatId, message);
        console.log(`Telegram message sent to ${chatId}`);
        return true;
    }
    catch (error) {
        console.error('Telegram sending failed:', error);
        return false;
    }
}
async function sendWhatsApp(phoneNumber, message) {
    if (!config_1.default.whatsapp.enabled) {
        console.error('WhatsApp not enabled');
        return false;
    }
    // WhatsApp Business API integration would go here
    // For POC, we'll use Twilio's WhatsApp integration
    if (!twilioClient) {
        console.error('Twilio client not initialized for WhatsApp');
        return false;
    }
    try {
        await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${config_1.default.twilio.phoneNumber}`,
            to: `whatsapp:${phoneNumber}`,
        });
        console.log(`WhatsApp message sent to ${phoneNumber}`);
        return true;
    }
    catch (error) {
        console.error('WhatsApp sending failed:', error);
        return false;
    }
}
function formatVerificationMessage(code) {
    return `Your Commed Habitude verification code is: ${code}\n\nThis code will expire in ${config_1.default.verification.expirationMinutes} minutes.`;
}
function formatReminderMessage(habitName, habitId) {
    return `⏰ Reminder: ${habitName}\n\nReply with "Habit (${habitId}): done" to mark as complete.`;
}
function formatCompletionConfirmation(habitName) {
    return `${habitName} Completed! 🎉`;
}
function formatStreakNotification(habitName, streakCount) {
    return `🔥 Amazing! You've completed "${habitName}" for ${streakCount} days in a row! Keep it up!`;
}
function parseCompletionReply(message) {
    // Expected format: "Habit (xxxx): done"
    const regex = /Habit\s*\((\d+)\)\s*:\s*done/i;
    const match = message.match(regex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}
function getTelegramBot() {
    return telegramBot;
}
exports.default = {
    sendMessage,
    formatVerificationMessage,
    formatReminderMessage,
    formatCompletionConfirmation,
    formatStreakNotification,
    parseCompletionReply,
    getTelegramBot,
};
//# sourceMappingURL=messaging.js.map