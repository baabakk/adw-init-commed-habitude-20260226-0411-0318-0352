"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.eventBus = void 0;
const events_1 = require("events");
class InternalEventBus extends events_1.EventEmitter {
}
exports.eventBus = new InternalEventBus();
exports.EVENTS = {
    HABIT_COMPLETED: 'HabitCompleted',
    STREAK_UPDATED: 'StreakUpdated',
    STREAK_THRESHOLD_REACHED: 'StreakThresholdReached',
};
