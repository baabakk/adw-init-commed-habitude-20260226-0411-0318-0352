"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/:habitId', async (req, res) => {
    const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
    const completionRepo = connection_1.AppDataSource.getRepository(models_1.HabitCompletion);
    const habit = await habitRepo.findOne({ where: { id: req.params.habitId, user: { id: req.user.id } }, relations: ['user'] });
    if (!habit)
        return res.status(404).json({ error: 'Habit not found' });
    const completions = await completionRepo.find({
        where: { habit: { id: habit.id } },
        order: { completionDate: 'ASC' },
        relations: ['habit'],
    });
    const last30Days = Array.from({ length: 30 }).map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - idx));
        return d.toISOString().slice(0, 10);
    });
    const completionSet = new Set(completions.map((c) => c.completionDate));
    const chartData = last30Days.map((date) => ({
        date,
        completed: completionSet.has(date) ? 1 : 0,
    }));
    return res.json({ habitId: habit.id, currentStreak: habit.currentStreak, chartData });
});
exports.default = router;
