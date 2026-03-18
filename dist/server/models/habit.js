"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHabit = createHabit;
exports.findHabitsByUserId = findHabitsByUserId;
exports.findHabitById = findHabitById;
exports.countActiveHabits = countActiveHabits;
exports.stopHabit = stopHabit;
exports.deleteHabit = deleteHabit;
exports.completeHabit = completeHabit;
exports.updateStreak = updateStreak;
exports.getCompletions = getCompletions;
exports.getCompletionsByDateRange = getCompletionsByDateRange;
exports.hasCompletionForDate = hasCompletionForDate;
exports.getAllActiveHabits = getAllActiveHabits;
const database_1 = require("../database");
async function createHabit(data) {
    const customTimesJson = data.custom_times ? JSON.stringify(data.custom_times) : null;
    const result = await (0, database_1.query)(`INSERT INTO habits (user_id, name, goal, frequency, custom_times, current_streak, longest_streak, is_active)
     VALUES ($1, $2, $3, $4, $5, 0, 0, true)
     RETURNING *`, [data.user_id, data.name, data.goal || null, data.frequency, customTimesJson]);
    return result.rows[0];
}
async function findHabitsByUserId(userId) {
    const result = await (0, database_1.query)('SELECT * FROM habits WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC', [userId]);
    return result.rows;
}
async function findHabitById(habitId) {
    const result = await (0, database_1.query)('SELECT * FROM habits WHERE id = $1', [habitId]);
    return result.rows[0] || null;
}
async function countActiveHabits(userId) {
    const result = await (0, database_1.query)('SELECT COUNT(*) as count FROM habits WHERE user_id = $1 AND is_active = true', [userId]);
    return parseInt(result.rows[0].count, 10);
}
async function stopHabit(habitId) {
    await (0, database_1.query)('UPDATE habits SET is_active = false, stopped_at = NOW() WHERE id = $1', [habitId]);
}
async function deleteHabit(habitId) {
    await (0, database_1.query)('DELETE FROM habits WHERE id = $1', [habitId]);
}
async function completeHabit(habitId, userId, completionDate, method) {
    try {
        const result = await (0, database_1.query)(`INSERT INTO completions (habit_id, user_id, completion_date, completion_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [habitId, userId, completionDate, method]);
        return result.rows[0];
    }
    catch (error) {
        // Handle unique constraint violation (duplicate completion)
        if (error.code === '23505') {
            return null;
        }
        throw error;
    }
}
async function updateStreak(habitId, currentStreak, longestStreak) {
    await (0, database_1.query)('UPDATE habits SET current_streak = $1, longest_streak = $2, last_completed_date = CURRENT_DATE WHERE id = $3', [currentStreak, longestStreak, habitId]);
}
async function getCompletions(habitId, limit = 30) {
    const result = await (0, database_1.query)(`SELECT * FROM completions 
     WHERE habit_id = $1 
     ORDER BY completion_date DESC 
     LIMIT $2`, [habitId, limit]);
    return result.rows;
}
async function getCompletionsByDateRange(habitId, startDate, endDate) {
    const result = await (0, database_1.query)(`SELECT * FROM completions 
     WHERE habit_id = $1 
     AND completion_date >= $2 
     AND completion_date <= $3
     ORDER BY completion_date ASC`, [habitId, startDate, endDate]);
    return result.rows;
}
async function hasCompletionForDate(habitId, date) {
    const result = await (0, database_1.query)('SELECT id FROM completions WHERE habit_id = $1 AND completion_date = $2', [habitId, date]);
    return result.rows.length > 0;
}
async function getAllActiveHabits() {
    const result = await (0, database_1.query)('SELECT * FROM habits WHERE is_active = true ORDER BY user_id, created_at');
    return result.rows;
}
exports.default = {
    createHabit,
    findHabitsByUserId,
    findHabitById,
    countActiveHabits,
    stopHabit,
    deleteHabit,
    completeHabit,
    updateStreak,
    getCompletions,
    getCompletionsByDateRange,
    hasCompletionForDate,
    getAllActiveHabits,
};
//# sourceMappingURL=habit.js.map