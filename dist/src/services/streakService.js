"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreakService = void 0;
const connection_1 = require("../db/connection");
const models_1 = require("../db/models");
const eventEmitter_1 = require("../events/eventEmitter");
const timezoneUtils_1 = require("../utils/timezoneUtils");
class StreakService {
    register() {
        eventEmitter_1.eventBus.on(eventEmitter_1.EVENTS.HABIT_COMPLETED, async (event) => {
            await this.handleHabitCompleted(event);
        });
    }
    async handleHabitCompleted(event) {
        const habitRepo = connection_1.AppDataSource.getRepository(models_1.Habit);
        const streakRepo = connection_1.AppDataSource.getRepository(models_1.Streak);
        const habit = await habitRepo.findOne({ where: { id: event.habitId }, relations: ['user'] });
        if (!habit || habit.user.id !== event.userId) {
            return;
        }
        let streak = await streakRepo.findOne({ where: { habit: { id: habit.id } }, relations: ['habit'] });
        if (!streak) {
            streak = streakRepo.create({ habit, currentCount: 0 });
        }
        if (!streak.lastCompletedDate) {
            streak.currentCount = 1;
        }
        else if ((0, timezoneUtils_1.isConsecutiveDay)(streak.lastCompletedDate, event.completionDate)) {
            streak.currentCount += 1;
        }
        else if (streak.lastCompletedDate !== event.completionDate) {
            streak.currentCount = 1;
        }
        streak.lastCompletedDate = event.completionDate;
        await streakRepo.save(streak);
        eventEmitter_1.eventBus.emit(eventEmitter_1.EVENTS.STREAK_UPDATED, {
            habitId: habit.id,
            userId: event.userId,
            currentCount: streak.currentCount,
        });
        if (streak.currentCount >= 3) {
            eventEmitter_1.eventBus.emit(eventEmitter_1.EVENTS.STREAK_THRESHOLD_REACHED, {
                habitId: habit.id,
                userId: event.userId,
                currentCount: streak.currentCount,
            });
        }
    }
}
exports.StreakService = StreakService;
