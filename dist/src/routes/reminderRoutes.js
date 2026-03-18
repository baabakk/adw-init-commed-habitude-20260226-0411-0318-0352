"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.ReminderSchedule);
    const schedules = await repo.find({
        where: { habit: { user: { id: req.user.id } } },
        relations: ['habit', 'habit.user'],
    });
    res.json(schedules);
});
router.post('/', async (req, res) => {
    const { habitId, timeOfDay, frequency, channels, enabled } = req.body;
    if (!habitId || !timeOfDay || !Array.isArray(channels) || channels.length === 0) {
        return res.status(400).json({ error: 'habitId, timeOfDay and channels are required' });
    }
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const scheduleRepo = connection_1.AppDataSource.getRepository(models_1.ReminderSchedule);
    const habit = await habitRepo.findOne({ where: { id: habitId, user: { id: req.user.id } }, relations: ['user'] });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    const schedule = scheduleRepo.create({
        habit,
        timeOfDay,
        frequency: frequency || 'daily',
        channels,
        enabled: enabled ?? true,
    });
    await scheduleRepo.save(schedule);
    return res.status(201).json(schedule);
});
router.put('/:id', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.ReminderSchedule);
    const schedule = await repo.findOne({
        where: { id: req.params.id, habit: { user: { id: req.user.id } } },
        relations: ['habit', 'habit.user'],
    });
    if (!schedule)
        return res.status(404).json({ error: 'Schedule not found' });
    schedule.timeOfDay = req.body.timeOfDay ?? schedule.timeOfDay;
    schedule.frequency = req.body.frequency ?? schedule.frequency;
    schedule.channels = req.body.channels ?? schedule.channels;
    schedule.enabled = req.body.enabled ?? schedule.enabled;
    await repo.save(schedule);
    return res.json(schedule);
});
router.delete('/:id', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.ReminderSchedule);
    const schedule = await repo.findOne({
        where: { id: req.params.id, habit: { user: { id: req.user.id } } },
        relations: ['habit', 'habit.user'],
    });
    if (!schedule)
        return res.status(404).json({ error: 'Schedule not found' });
    await repo.remove(schedule);
    return res.status(204).send();
});
exports.default = router;
