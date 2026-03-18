"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ReminderQueue extends events_1.EventEmitter {
    publish(event, payload) {
        this.emit(event, payload);
    }
    subscribe(event, listener) {
        this.on(event, listener);
    }
}
const queue = new ReminderQueue();
exports.default = queue;
