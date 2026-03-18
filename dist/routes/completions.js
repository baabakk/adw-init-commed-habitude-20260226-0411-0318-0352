"use strict";
/**
 * REST API endpoints for habit completion tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const habitService_1 = require("../habitService");
const reminderService_1 = require("../reminderService");
const router = (0, express_1.Router)();
/**
 * POST /api/completions
 * Mark a habit as complete
 */
router.post('/', async (req, res) => {
    try {
        const { habitId, date } = req.body;
        if (!habitId) {
            return res.status(400).json({
                success: false,
                error: 'habitId is required'
            });
        }
        // MVP: Use default user (no auth)
        const userId = 'default-user';
        // Parse date if provided
        const completionDate = date ? new Date(date) : undefined;
        const completion = habitService_1.habitService.markComplete(habitId, userId, completionDate);
        // Check if streak notification should be sent
        await reminderService_1.reminderService.checkStreakNotification(habitId);
        res.status(201).json({
            success: true,
            data: completion
        });
    }
    catch (error) {
        console.error('Error marking habit complete:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark habit complete'
        });
    }
});
/**
 * GET /api/completions/:habitId
 * Get completion history for a habit
 */
router.get('/:habitId', async (req, res) => {
    try {
        const { habitId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const habit = habitService_1.habitService.getHabit(habitId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'Habit not found'
            });
        }
        const completions = habitService_1.habitService.getCompletionHistory(habitId, days);
        res.json({
            success: true,
            data: completions
        });
    }
    catch (error) {
        console.error('Error fetching completions:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch completions'
        });
    }
});
/**
 * GET /api/completions/:habitId/today
 * Check if habit is completed today
 */
router.get('/:habitId/today', async (req, res) => {
    try {
        const { habitId } = req.params;
        const habit = habitService_1.habitService.getHabit(habitId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'Habit not found'
            });
        }
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const completions = habitService_1.habitService.getCompletionHistory(habitId, 1);
        const completedToday = completions.some(c => c.date === dateString);
        res.json({
            success: true,
            data: {
                habitId,
                date: dateString,
                completed: completedToday
            }
        });
    }
    catch (error) {
        console.error('Error checking today completion:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check completion'
        });
    }
});
/**
 * GET /api/completions
 * Get all completions for the current user
 */
router.get('/', async (req, res) => {
    try {
        // MVP: Use default user (no auth)
        const userId = 'default-user';
        const habits = habitService_1.habitService.getUserHabits(userId);
        const allCompletions = habits.map(habit => ({
            habitId: habit.id,
            habitName: habit.name,
            completions: habitService_1.habitService.getCompletionHistory(habit.id, 30)
        }));
        res.json({
            success: true,
            data: allCompletions
        });
    }
    catch (error) {
        console.error('Error fetching all completions:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch completions'
        });
    }
});
exports.default = router;
