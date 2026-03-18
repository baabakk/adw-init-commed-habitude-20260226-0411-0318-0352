import { ReminderScheduledPayload } from './queue';
declare const sendSMS: (payload: ReminderScheduledPayload) => Promise<any>;
declare const sendTelegram: (payload: ReminderScheduledPayload) => Promise<any>;
declare const sendWhatsApp: (payload: ReminderScheduledPayload) => Promise<any>;
export { sendSMS, sendTelegram, sendWhatsApp };
