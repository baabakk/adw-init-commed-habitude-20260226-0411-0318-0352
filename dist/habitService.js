"use strict";
/**
 * Business logic for habit management, completion tracking, and streak calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.habitService = exports.HabitService = void 0;
const database_1 = require("./database");
class HabitService {
    /**
     * Create a new habit
     */
    createHabit(userId, name, description, goal) {
        // Check for duplicate habit names for the user
        const existingHabits = database_1.db.getHabitsByUser(userId);
        const duplicate = existingHabits.find(h => h.name.toLowerCase() === name.toLowerCase() && h.isActive);
        if (duplicate) {
            throw new Error(`Habit with name "${name}" already exists`);
        }
        const habit = {
            id: this.generateId(),
            userId,
            name,
            description,
            goal,
            createdAt: new Date(),
            isActive: true
        };
        return database_1.db.createHabit(habit);
    }
    /**
     * Get all habits for a user
     */
    getUserHabits(userId) {
        return database_1.db.getHabitsByUser(userId).filter(h => h.isActive);
    }
    /**
     * Get a specific habit
     */
    getHabit(habitId) {
        return database_1.db.getHabit(habitId);
    }
    /**
     * Update a habit
     */
    updateHabit(habitId, updates) {
        const habit = database_1.db.getHabit(habitId);
        if (!habit) {
            throw new Error('Habit not found');
        }
        // Prevent changing userId or id
        delete updates.userId;
        delete updates.id;
        const updated = database_1.db.updateHabit(habitId, updates);
        if (!updated) {
            throw new Error('Failed to update habit');
        }
        return updated;
    }
    /**
     * Delete a habit (soft delete by marking inactive)
     */
    deleteHabit(habitId) {
        const habit = database_1.db.getHabit(habitId);
        if (!habit) {
            throw new Error('Habit not found');
        }
        // Soft delete
        database_1.db.updateHabit(habitId, { isActive: false });
        return true;
    }
    /**
     * Mark a habit as complete for a specific date
     */
    markComplete(habitId, userId, date) {
        const habit = database_1.db.getHabit(habitId);
        if (!habit) {
            throw new Error('Habit not found');
        }
        if (habit.userId !== userId) {
            throw new Error('Unauthorized');
        }
        const completionDate = date || new Date();
        const dateString = this.formatDate(completionDate);
        // Check if already completed for this date
        const existing = database_1.db.getCompletionsByDate(habitId, dateString);
        if (existing.length > 0) {
            return existing[0]; // Already completed
        }
        const completion = {
            id: this.generateId(),
            habitId,
            userId,
            completedAt: completionDate,
            date: dateString
        };
        const created = database_1.db.createCompletion(completion);
        // Update streak
        this.updateStreak(habitId, userId);
        return created;
    }
    /**
     * Get completion history for a habit
     */
    getCompletionHistory(habitId, days = 30) {
        const completions = database_1.db.getCompletionsByHabit(habitId);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return completions.filter(c => c.completedAt >= cutoffDate);
    }
    /**
     * Calculate and update streak for a habit
     */
    updateStreak(habitId, userId) {
        const completions = database_1.db.getCompletionsByHabit(habitId);
        const today = this.formatDate(new Date());
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastCompletionDate = '';
        if (completions.length === 0) {
            const streak = {
                habitId,
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastCompletionDate: ''
            };
            return database_1.db.updateStreak(habitId, streak);
        }
        // Sort completions by date (newest first)
        const sortedCompletions = completions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        // Get unique dates
        const uniqueDates = Array.from(new Set(sortedCompletions.map(c => c.date))).sort().reverse();
        lastCompletionDate = uniqueDates[0];
        // Calculate current streak
        let checkDate = new Date();
        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = this.formatDate(checkDate);
            if (uniqueDates[i] === expectedDate) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else {
                break;
            }
        }
        // Calculate longest streak
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const nextDate = new Date(uniqueDates[i + 1]);
            const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            }
            else {
                tempStreak = 1;
            }
        }
        const streak = {
            habitId,
            userId,
            currentStreak,
            longestStreak,
            lastCompletionDate
        };
        return database_1.db.updateStreak(habitId, streak);
    }
    /**
     * Get streak information for a habit
     */
    getStreak(habitId) {
        const streak = database_1.db.getStreak(habitId);
        if (!streak) {
            return {
                habitId,
                userId: '',
                currentStreak: 0,
                longestStreak: 0,
                lastCompletionDate: ''
            };
        }
        return streak;
    }
    /**
     * Get progress data for visualization
     */
    getProgressData(habitId, days = 30) {
        const habit = database_1.db.getHabit(habitId);
        if (!habit) {
            throw new Error('Habit not found');
        }
        const completions = this.getCompletionHistory(habitId, days);
        const streak = this.getStreak(habitId);
        // Generate array of last N days
        const progressDays = [];
        const completionDates = new Set(completions.map(c => c.date));
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = this.formatDate(date);
            progressDays.push({
                date: dateString,
                completed: completionDates.has(dateString)
            });
        }
        const completionRate = progressDays.length > 0
            ? (progressDays.filter(d => d.completed).length / progressDays.length) * 100
            : 0;
        return {
            habitId: habit.id,
            habitName: habit.name,
            completions: progressDays,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            completionRate: Math.round(completionRate * 10) / 10
        };
    }
    /**
     * Check if a habit should trigger a streak notification
     */
    shouldSendStreakNotification(habitId) {
        const streak = this.getStreak(habitId);
        // Send notification at 3, 7, 14, 30, 60, 90, 180, 365 days
        const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
        return milestones.includes(streak.currentStreak);
    }
    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.HabitService = HabitService;
exports.habitService = new HabitService();
