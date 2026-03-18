"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitModel = void 0;
const database_1 = require("../database");
class HabitModel {
    static async create(data) {
        const result = await (0, database_1.execute)(`INSERT INTO habits (user_id, name, description, goal, reminder_time, reminder_frequency, reminder_enabled, preferred_channel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.user_id,
            data.name,
            data.description || null,
            data.goal || null,
            data.reminder_time || null,
            data.reminder_frequency || 'daily',
            data.reminder_enabled !== false ? 1 : 0,
            data.preferred_channel || 'sms',
        ]);
        const habit = await this.findById(result.lastID);
        if (!habit) {
            throw new Error('Failed to create habit');
        }
        return habit;
    }
    static async findById(id) {
        return (0, database_1.queryOne)('SELECT * FROM habits WHERE id = ?', [id]);
    }
    static async findByUserId(userId) {
        return (0, database_1.query)('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    }
    static async findAll() {
        return (0, database_1.query)('SELECT * FROM habits ORDER BY created_at DESC');
    }
    static async update(id, data) {
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.goal !== undefined) {
            updates.push('goal = ?');
            values.push(data.goal);
        }
        if (data.reminder_time !== undefined) {
            updates.push('reminder_time = ?');
            values.push(data.reminder_time);
        }
        if (data.reminder_frequency !== undefined) {
            updates.push('reminder_frequency = ?');
            values.push(data.reminder_frequency);
        }
        if (data.reminder_enabled !== undefined) {
            updates.push('reminder_enabled = ?');
            values.push(data.reminder_enabled ? 1 : 0);
        }
        if (data.preferred_channel !== undefined) {
            updates.push('preferred_channel = ?');
            values.push(data.preferred_channel);
        }
        updates.push("updated_at = datetime('now', 'utc')");
        values.push(id);
        await (0, database_1.execute)(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`, values);
        const habit = await this.findById(id);
        if (!habit) {
            throw new Error('Habit not found after update');
        }
        return habit;
    }
    static async delete(id) {
        await (0, database_1.execute)('DELETE FROM habits WHERE id = ?', [id]);
    }
    static async markComplete(habitId, date) {
        const completionDate = date || new Date().toISOString().split('T')[0];
        try {
            const result = await (0, database_1.execute)(`INSERT INTO habit_completions (habit_id, completion_date)
         VALUES (?, ?)`, [habitId, completionDate]);
            const completion = await (0, database_1.queryOne)('SELECT * FROM habit_completions WHERE id = ?', [result.lastID]);
            if (!completion) {
                throw new Error('Failed to create completion');
            }
            return completion;
        }
        catch (error) {
            if (error.message?.includes('UNIQUE constraint failed')) {
                throw new Error('Habit already marked complete for this date');
            }
            throw error;
        }
    }
    static async unmarkComplete(habitId, date) {
        const completionDate = date || new Date().toISOString().split('T')[0];
        await (0, database_1.execute)('DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?', [habitId, completionDate]);
    }
    static async getCompletions(habitId, startDate, endDate) {
        let sql = 'SELECT * FROM habit_completions WHERE habit_id = ?';
        const params = [habitId];
        if (startDate) {
            sql += ' AND completion_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND completion_date <= ?';
            params.push(endDate);
        }
        sql += ' ORDER BY completion_date DESC';
        return (0, database_1.query)(sql, params);
    }
    static async calculateStreak(habitId) {
        const completions = await this.getCompletions(habitId);
        if (completions.length === 0) {
            return { current_streak: 0, longest_streak: 0 };
        }
        // Sort by date ascending
        const sortedDates = completions
            .map(c => c.completion_date)
            .sort()
            .reverse(); // Most recent first
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        // Calculate current streak
        let expectedDate = new Date();
        let foundToday = false;
        for (const dateStr of sortedDates) {
            const completionDate = new Date(dateStr + 'T00:00:00Z');
            const expectedDateStr = expectedDate.toISOString().split('T')[0];
            if (dateStr === expectedDateStr) {
                currentStreak++;
                if (dateStr === today) {
                    foundToday = true;
                }
                expectedDate = new Date(expectedDate.getTime() - 86400000); // Previous day
            }
            else if (dateStr === yesterday && !foundToday) {
                // Allow streak to continue if completed yesterday but not today yet
                currentStreak++;
                expectedDate = new Date(expectedDate.getTime() - 86400000);
            }
            else {
                break;
            }
        }
        // Calculate longest streak
        let prevDate = null;
        for (const dateStr of sortedDates.reverse()) {
            const currentDate = new Date(dateStr + 'T00:00:00Z');
            if (prevDate === null) {
                tempStreak = 1;
            }
            else {
                const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);
                if (dayDiff === 1) {
                    tempStreak++;
                }
                else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            prevDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        return { current_streak: currentStreak, longest_streak: longestStreak };
    }
    static async getHabitWithStats(habitId) {
        const habit = await this.findById(habitId);
        if (!habit) {
            return undefined;
        }
        const streaks = await this.calculateStreak(habitId);
        const completions = await this.getCompletions(habitId);
        // Calculate completion rate for last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const recentCompletions = completions.filter(c => c.completion_date >= thirtyDaysAgo);
        const completionRate = (recentCompletions.length / 30) * 100;
        return {
            ...habit,
            current_streak: streaks.current_streak,
            longest_streak: streaks.longest_streak,
            total_completions: completions.length,
            completion_rate: Math.round(completionRate * 10) / 10,
        };
    }
    static async getHabitsWithStats(userId) {
        const habits = await this.findByUserId(userId);
        const habitsWithStats = [];
        for (const habit of habits) {
            const habitWithStats = await this.getHabitWithStats(habit.id);
            if (habitWithStats) {
                habitsWithStats.push(habitWithStats);
            }
        }
        return habitsWithStats;
    }
    static async getHabitsNeedingReminders() {
        // Get habits with reminders enabled
        return (0, database_1.query)(`SELECT * FROM habits 
       WHERE reminder_enabled = 1 
       AND reminder_time IS NOT NULL
       ORDER BY reminder_time`);
    }
}
exports.HabitModel = HabitModel;
