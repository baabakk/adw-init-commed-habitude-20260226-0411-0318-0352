"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const eventEmitter_1 = require("../events/eventEmitter");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habits = await habitRepo.find({
        where: { user: { id: req.user.id } },
        relations: ['reminders']
    });
    res.json(habits);
});
router.post('/', async (req, res) => {
    const { name, goal } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Habit name is required' });
    const userRepo = connection_1.AppDataSource.getRepository(models_1.User);
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const user = await userRepo.findOneBy({ id: req.user.id });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const existing = await habitRepo.findOne({ where: { user: { id: user.id }, name } });
    if (existing)
        return res.status(409).json({ error: 'Duplicate habit name' });
    const habit = habitRepo.create({ name, goal, user });
    await habitRepo.save(habit);
    res.status(201).json(habit);
});
router.put('/:id', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habit = await habitRepo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    habit.name = req.body.name ?? habit.name;
    habit.goal = req.body.goal ?? habit.goal;
    habit.isActive = req.body.isActive ?? habit.isActive;
    await habitRepo.save(habit);
    res.json(habit);
});
router.delete('/:id', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const habit = await habitRepo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    await habitRepo.remove(habit);
    res.status(204).send();
});
router.post('/:id/complete', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const completionRepo = connection_1.AppDataSource.getRepository(models_1.HabitCompletion);
    const habit = await habitRepo.findOne({ where: { id: req.params.id, user: { id: req.user.id } } });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    const completion = completionRepo.create({ habit });
    await completionRepo.save(completion);
    eventEmitter_1.eventBus.emit(eventEmitter_1.EVENTS.HABIT_COMPLETED, {
        userId: req.user.id,
        habitId: habit.id,
        completedAt: completion.completedAt
    });
    res.status(201).json({ message: 'Habit marked complete' });
});
exports.default = router;
