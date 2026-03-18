"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStreakHandlers = registerStreakHandlers;
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const eventEmitter_1 = require("../events/eventEmitter");
const timezoneUtils_1 = require("../utils/timezoneUtils");
function registerStreakHandlers() {
    eventEmitter_1.eventBus.on(eventEmitter_1.EVENTS.HABIT_COMPLETED, async (event) => {
        const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
        const completionRepo = connection_1.AppDataSource.getRepository(models_1.HabitCompletion);
        const habit = await habitRepo.findOne({
            where: { id: event.habitId },
            relations: ['user']
        });
        if (!habit)
            return;
        const completions = await completionRepo.find({
            where: { habit: { id: habit.id } },
            order: { completedAt: 'DESC' },
            take: 2
        });
        if (completions.length < 2) {
            habit.currentStreak = 1;
        }
        else {
            const [latest, previous] = completions;
            habit.currentStreak = (0, timezoneUtils_1.isConsecutiveDay)(previous.completedAt, latest.completedAt, habit.user.timezone)
                ? habit.currentStreak + 1
                : 1;
        }
        await habitRepo.save(habit);
    });
}
