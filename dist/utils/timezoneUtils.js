"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDate = toUserDate;
exports.isConsecutiveDay = isConsecutiveDay;
function toUserDate(date, timezone) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}
function isConsecutiveDay(previous, current, timezone) {
    const prev = new Date(toUserDate(previous, timezone));
    const curr = new Date(toUserDate(current, timezone));
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    return diff === 1;
}
