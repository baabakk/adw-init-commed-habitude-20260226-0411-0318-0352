"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleReminders = scheduleReminders;
const node_cron_1 = __importDefault(require("node-cron"));
const data_store_1 = require("./data-store");
const sms_1 = require("./messaging/sms");
const telegram_1 = require("./messaging/telegram");
const whatsapp_1 = require("./messaging/whatsapp");
let scheduledJobs = [];
function scheduleReminders() {
    // Clear existing jobs
    scheduledJobs.forEach(job => job.stop());
    scheduledJobs = [];
    // Schedule new jobs based on habits
    data_store_1.habits.forEach(habit => {
        const [hour, minute] = habit.reminderTime.split(':').map(Number);
        // Use cron syntax: minute hour day-of-month month day-of-week
        const cronTime = `${minute} ${hour} * * *`;
        const job = node_cron_1.default.schedule(cronTime, () => {
            console.log(`Sending reminder for habit '${habit.name}' at ${habit.reminderTime}`);
            habit.reminderChannels.forEach(channel => {
                try {
                    switch (channel) {
                        case 'sms':
                            (0, sms_1.sendSMSReminder)(habit);
                            break;
                        case 'telegram':
                            (0, telegram_1.sendTelegramReminder)(habit);
                            break;
                        case 'whatsapp':
                            (0, whatsapp_1.sendWhatsAppReminder)(habit);
                            break;
                    }
                }
                catch (error) {
                    console.error(`Failed to send ${channel} reminder for habit ${habit.id}:`, error);
                }
            });
        });
        scheduledJobs.push(job);
    });
    console.log(`Scheduled ${scheduledJobs.length} reminder jobs`);
}
