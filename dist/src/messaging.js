"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = exports.sendTelegram = exports.sendSMS = void 0;
const queue_1 = __importDefault(require("./queue"));
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Adapter functions to send reminders via external messaging platforms.
 * In a real implementation these would call the actual provider APIs with proper authentication.
 */
const sendSMS = async (payload) => {
    const response = await (0, node_fetch_1.default)('https://api.example.com/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: payload.userId, // placeholder – map userId to phone number in real app
            message: `Reminder: habit ${payload.habitId} is due now.`,
            schedule: payload.schedule,
        }),
    });
    if (!response.ok) {
        throw new Error(`SMS send failed: ${response.statusText}`);
    }
    return response.json();
};
exports.sendSMS = sendSMS;
const sendTelegram = async (payload) => {
    const response = await (0, node_fetch_1.default)('https://api.example.com/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chatId: payload.userId, // placeholder – map to Telegram chat ID
            text: `Reminder: habit ${payload.habitId} is due now.`,
            schedule: payload.schedule,
        }),
    });
    if (!response.ok) {
        throw new Error(`Telegram send failed: ${response.statusText}`);
    }
    return response.json();
};
exports.sendTelegram = sendTelegram;
const sendWhatsApp = async (payload) => {
    const response = await (0, node_fetch_1.default)('https://api.example.com/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: payload.userId, // placeholder – map to WhatsApp number
            body: `Reminder: habit ${payload.habitId} is due now.`,
            schedule: payload.schedule,
        }),
    });
    if (!response.ok) {
        throw new Error(`WhatsApp send failed: ${response.statusText}`);
    }
    return response.json();
};
exports.sendWhatsApp = sendWhatsApp;
// Central dispatcher based on channel
const dispatch = async (payload) => {
    try {
        switch (payload.channel) {
            case 'sms':
                await sendSMS(payload);
                break;
            case 'telegram':
                await sendTelegram(payload);
                break;
            case 'whatsapp':
                await sendWhatsApp(payload);
                break;
            default:
                console.warn('Unknown channel', payload.channel);
        }
        console.log(`Reminder sent for habit ${payload.habitId} via ${payload.channel}`);
    }
    catch (err) {
        console.error('Failed to send reminder', err);
        // In production, implement retry/backoff logic here
    }
};
// Subscribe to the in‑memory queue
queue_1.default.subscribe('ReminderScheduled', dispatch);
