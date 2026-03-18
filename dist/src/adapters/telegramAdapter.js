"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
class TelegramAdapter {
    async send(payload) {
        if (!payload.to) {
            throw new Error('Telegram destination is required');
        }
        await Promise.resolve();
    }
}
exports.TelegramAdapter = TelegramAdapter;
