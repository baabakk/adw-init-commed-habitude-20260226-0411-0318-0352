"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.eventBus = void 0;
const events_1 = require("events");
class AppEventEmitter extends events_1.EventEmitter {
}
exports.eventBus = new AppEventEmitter();
exports.EVENTS = {
    HABIT_COMPLETED: 'HabitCompleted'
};
