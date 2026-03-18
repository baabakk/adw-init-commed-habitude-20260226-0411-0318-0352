"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStreak = calculateStreak;
const data_store_1 = require("../data-store");
const data_store_2 = require("../data-store");
/**
 * Calculates the current streak for a habit, accounting for user's timezone
 * and midnight rollover edge cases.
 */
function calculateStreak(habitId) {
    const habit = (0, data_store_2.getHabitById)(habitId);
    if (!habit)
        return 0;
    // Get user's timezone offset in minutes
    const timezoneOffset = new Date().getTimezoneOffset();
    // Get all completions for this habit
    const habitCompletions = data_store_1.completions
        .filter(c => c.habitId === habitId)
        .map(c => {
        // Adjust date based on user's timezone
        const date = new Date(c.date);
        date.setMinutes(date.getMinutes() - timezoneOffset);
        return date.toISOString().split('T')[0];
    })
        .sort();
    if (habitCompletions.length === 0)
        return 0;
    // Get today's date in user's timezone
    const today = new Date();
    today.setMinutes(today.getMinutes() - timezoneOffset);
    const todayStr = today.toISOString().split('T')[0];
    // Check if habit was completed today
    const completedToday = habitCompletions.includes(todayStr);
    // Start counting streak
    let streak = completedToday ? 1 : 0;
    let expectedDate = new Date(todayStr);
    // If not completed today, check yesterday
    if (!completedToday) {
        expectedDate.setDate(expectedDate.getDate() - 1);
    }
    // Count backwards
    while (true) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        if (habitCompletions.includes(expectedDateStr)) {
            streak++;
        }
        else {
            break;
        }
    }
    return streak;
}
