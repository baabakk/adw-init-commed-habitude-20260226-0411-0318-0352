"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsAdapter = void 0;
class SmsAdapter {
    async send(payload) {
        if (!payload.to) {
            throw new Error('SMS destination is required');
        }
        await Promise.resolve();
    }
}
exports.SmsAdapter = SmsAdapter;
