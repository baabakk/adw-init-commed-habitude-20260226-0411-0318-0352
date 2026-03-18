"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverReminder = deliverReminder;
const smsAdapter_1 = require("../adapters/smsAdapter");
const telegramAdapter_1 = require("../adapters/telegramAdapter");
const whatsappAdapter_1 = require("../adapters/whatsappAdapter");
const retryLogic_1 = require("../utils/retryLogic");
const smsAdapter = new smsAdapter_1.SmsAdapter();
const telegramAdapter = new telegramAdapter_1.TelegramAdapter();
const whatsappAdapter = new whatsappAdapter_1.WhatsAppAdapter();
async function deliverReminder(channel, recipient, message) {
    const send = async () => {
        switch (channel) {
            case 'sms':
                await smsAdapter.sendMessage(recipient, message);
                break;
            case 'telegram':
                await telegramAdapter.sendMessage(recipient, message);
                break;
            case 'whatsapp':
                await whatsappAdapter.sendMessage(recipient, message);
                break;
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
    };
    try {
        await (0, retryLogic_1.withRetry)(send, 3, 1000);
        console.log(`Reminder delivered via ${channel} to ${recipient}`);
    }
    catch (error) {
        console.error(`Reminder delivery failed via ${channel} to ${recipient}`, error);
        throw error;
    }
}
