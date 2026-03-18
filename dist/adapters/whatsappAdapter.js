"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
class WhatsAppAdapter {
    async sendMessage(to, message) {
        if (!to)
            throw new Error('WhatsApp recipient is required');
        console.log(`[WhatsApp] Sending to ${to}: ${message}`);
    }
}
exports.WhatsAppAdapter = WhatsAppAdapter;
