"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const auth_1 = require("../middleware/auth");
const eventEmitter_1 = require("../events/eventEmitter");
const timezoneUtils_1 = require("../utils/timezoneUtils");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.post('/', async (req, res) => {
    try {
        const repo = connection_1.AppDataSource.getRepository(models_1.Habit);
        const existing = await repo.findOne({ where: { user: { id: req.user.id }, name: req.body.name } });
        if (existing) {
            return res.status(409).json({ error: 'Habit with this name already exists' });
        }
        const habit = repo.create({
            user: { id: req.user.id },
            name: req.body.name,
            description: req.body.description,
            goal: req.body.goal,
            reminderSchedule: req.body.reminderSchedule || '0 8 * * *',
        });
        const saved = await repo.save(habit);
        return res.status(201).json(saved);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create habit', details: error.message });
    }
});
router.get('/:id', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const streakRepo = connection_1.AppDataSource.getRepository(models_1.Streak);
    const habit = await repo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    const streak = await streakRepo.findOne({ where: { habit: { id: habit.id } } });
    return res.json({ ...habit, streak: streak?.currentCount || 0 });
});
router.get('/', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habits = await repo.find({ where: { user: { id: req.user.id } } });
    return res.json(habits);
});
router.put('/:id', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habit = await repo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    repo.merge(habit, req.body);
    const updated = await repo.save(habit);
    return res.json(updated);
});
router.delete('/:id', async (req, res) => {
    const repo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habit = await repo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    await repo.remove(habit);
    return res.status(204).send();
});
router.post('/:id/complete', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const completionRepo = connection_1.AppDataSource.getRepository(models_1.HabitCompletion);
    const habit = await habitRepo.findOne({ where: { id: req.params.id, user: { id: req.user.id } }, relations: ['user'] });
    if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    const completionDate = req.body.date || (0, timezoneUtils_1.toUserDateString)(new Date(), habit.user.timezone || 'UTC');
    let completion = await completionRepo.findOne({ where: { habit: { id: habit.id }, date: completionDate } });
    if (!completion) {
        completion = completionRepo.create({ habit, date: completionDate, completed: true });
    }
    else {
        completion.completed = true;
    }
    await completionRepo.save(completion);
    eventEmitter_1.eventBus.emit(eventEmitter_1.EVENTS.HABIT_COMPLETED, {
        habitId: habit.id,
        userId: req.user.id,
        completionDate,
    });
    return res.json({ success: true, completionDate });
});
exports.default = router;
