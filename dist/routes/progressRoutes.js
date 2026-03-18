"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const router = (0, express_1.Router)();
router.get('/:habitId', async (req, res) => {
    const completionRepo = connection_1.AppDataSource.getRepository(models_1.HabitCompletion);
    const days = Number(req.query.days || 30);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const completions = await completionRepo.find({
        where: {
            habit: { id: req.params.habitId, user: { id: req.user.id } },
            completedAt: { $gte: since }
        },
        order: { completedAt: 'ASC' }
    });
    const data = completions.map((c) => ({ date: c.completedAt.toISOString().slice(0, 10), value: 1 }));
    res.json({ habitId: req.params.habitId, days, data });
});
exports.default = router;
