"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsAdapter = void 0;
class SmsAdapter {
    async sendMessage(to, message) {
        if (!to)
            throw new Error('SMS recipient is required');
        console.log(`[SMS] Sending to ${to}: ${message}`);
    }
}
exports.SmsAdapter = SmsAdapter;
