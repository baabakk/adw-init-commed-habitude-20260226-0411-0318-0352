"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
class TelegramAdapter {
    async sendMessage(chatId, message) {
        if (!chatId)
            throw new Error('Telegram chatId is required');
        console.log(`[Telegram] Sending to ${chatId}: ${message}`);
    }
}
exports.TelegramAdapter = TelegramAdapter;
