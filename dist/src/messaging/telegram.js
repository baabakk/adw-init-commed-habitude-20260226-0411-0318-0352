"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramReminder = sendTelegramReminder;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
    console.warn('Telegram credentials not configured. Telegram reminders disabled.');
}
const bot = token ? new node_telegram_bot_api_1.default(token) : null;
function sendTelegramReminder(habit) {
    if (!bot) {
        console.log('Telegram reminder would be sent:', `Time to do: ${habit.name}`);
        return;
    }
    bot.sendMessage(chatId, `⏰ Time to do: ${habit.name}`)
        .then(() => console.log('Telegram message sent'))
        .catch(error => console.error('Failed to send Telegram message:', error));
}
