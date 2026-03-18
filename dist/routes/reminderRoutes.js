"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const reminderDeliveryService_1 = require("../services/reminderDeliveryService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { habitId, time, frequency, channel } = req.body;
    if (!habitId || !time || !channel) {
        return res.status(400).json({ error: 'habitId, time, and channel are required' });
    }
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const reminderRepo = connection_1.AppDataSource.getRepository(models_1.Reminder);
    const habit = await habitRepo.findOne({ where: { id: habitId, user: { id: req.user.id } } });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    const reminder = reminderRepo.create({ habit, time, frequency: frequency || 'daily', channel });
    await reminderRepo.save(reminder);
    res.status(201).json(reminder);
});
router.get('/', async (req, res) => {
    const reminderRepo = connection_1.AppDataSource.getRepository(models_1.Reminder);
    const reminders = await reminderRepo.find({
        where: { habit: { user: { id: req.user.id } } },
        relations: ['habit']
    });
    res.json(reminders);
});
router.post('/:id/send-test', async (req, res) => {
    const reminderRepo = connection_1.AppDataSource.getRepository(models_1.Reminder);
    const userRepo = connection_1.AppDataSource.getRepository(models_1.User);
    const reminder = await reminderRepo.findOne({
        where: { id: req.params.id, habit: { user: { id: req.user.id } } },
        relations: ['habit', 'habit.user']
    });
    if (!reminder)
        return res.status(404).json({ error: 'Reminder not found' });
    const user = await userRepo.findOneBy({ id: req.user.id });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const recipient = reminder.channel === 'sms'
        ? user.phoneNumber
        : reminder.channel === 'telegram'
            ? user.telegramChatId
            : user.whatsappNumber;
    if (!recipient)
        return res.status(400).json({ error: `No recipient configured for ${reminder.channel}` });
    await (0, reminderDeliveryService_1.deliverReminder)(reminder.channel, recipient, `Reminder: ${reminder.habit.name}`);
    res.json({ message: 'Test reminder sent' });
});
exports.default = router;
