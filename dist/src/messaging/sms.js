"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMSReminder = sendSMSReminder;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.USER_PHONE_NUMBER;
if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.warn('Twilio credentials not configured. SMS reminders disabled.');
}
const twilioClient = accountSid && authToken ? (0, twilio_1.default)(accountSid, authToken) : null;
function sendSMSReminder(habit) {
    if (!twilioClient) {
        console.log('SMS reminder would be sent:', `Time to do: ${habit.name}`);
        return;
    }
    twilioClient.messages
        .create({
        body: `⏰ Time to do: ${habit.name}`,
        from: fromNumber,
        to: toNumber
    })
        .then(message => console.log('SMS sent:', message.sid))
        .catch(error => console.error('Failed to send SMS:', error));
}
