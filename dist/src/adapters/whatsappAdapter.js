"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
class WhatsAppAdapter {
    async send(payload) {
        if (!payload.to) {
            throw new Error('WhatsApp destination is required');
        }
        await Promise.resolve();
    }
}
exports.WhatsAppAdapter = WhatsAppAdapter;
