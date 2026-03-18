"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConsecutiveDay = exports.toUserDateString = void 0;
const toUserDateString = (date, timezone) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(date);
};
exports.toUserDateString = toUserDateString;
const isConsecutiveDay = (previousDate, currentDate) => {
    const prev = new Date(`${previousDate}T00:00:00Z`);
    const curr = new Date(`${currentDate}T00:00:00Z`);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    return diff === 1;
};
exports.isConsecutiveDay = isConsecutiveDay;
