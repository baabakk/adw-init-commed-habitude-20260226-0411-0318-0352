"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderDeliveryService = void 0;
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const smsAdapter_1 = require("../adapters/smsAdapter");
const telegramAdapter_1 = require("../adapters/telegramAdapter");
const whatsappAdapter_1 = require("../adapters/whatsappAdapter");
const retryLogic_1 = require("../utils/retryLogic");
const smsAdapter = new smsAdapter_1.SmsAdapter();
const telegramAdapter = new telegramAdapter_1.TelegramAdapter();
const whatsappAdapter = new whatsappAdapter_1.WhatsAppAdapter();
class ReminderDeliveryService {
    async deliverReminder(reminderScheduleId, message) {
        const scheduleRepo = connection_1.AppDataSource.getRepository(models_1.ReminderSchedule);
        const userRepo = connection_1.AppDataSource.getRepository(models_1.User);
        const logRepo = connection_1.AppDataSource.getRepository(models_1.MessagingEventLog);
        const schedule = await scheduleRepo.findOne({ where: { id: reminderScheduleId }, relations: ['habit'] });
        if (!schedule || !schedule.active) {
            throw new Error('Reminder schedule not found or inactive');
        }
        const user = await userRepo.findOne({ where: { id: schedule.userId } });
        if (!user) {
            throw new Error('User not found for reminder delivery');
        }
        const destination = schedule.channel === 'sms'
            ? user.phoneNumber
            : schedule.channel === 'telegram'
                ? user.telegramId
                : user.whatsappNumber;
        if (!destination) {
            throw new Error(`No destination configured for channel ${schedule.channel}`);
        }
        await (0, retryLogic_1.withRetry)(async (attempt) => {
            try {
                if (schedule.channel === 'sms') {
                    await smsAdapter.send({ to: destination, message });
                }
                else if (schedule.channel === 'telegram') {
                    await telegramAdapter.send({ to: destination, message });
                }
                else {
                    await whatsappAdapter.send({ to: destination, message });
                }
                await logRepo.save(logRepo.create({
                    userId: user.id,
                    habitId: schedule.habit.id,
                    channel: schedule.channel,
                    message,
                    attempt,
                    success: true,
                }));
            }
            catch (error) {
                await logRepo.save(logRepo.create({
                    userId: user.id,
                    habitId: schedule.habit.id,
                    channel: schedule.channel,
                    message,
                    attempt,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                }));
                throw error;
            }
        }, { retries: 3, delayMs: 500 });
    }
}
exports.ReminderDeliveryService = ReminderDeliveryService;
