"use strict";
/**
 * REST API endpoints for reminder management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminderService_1 = require("../reminderService");
const messagingService_1 = require("../messagingService");
const router = (0, express_1.Router)();
/**
 * GET /api/reminders
 * Get all reminders for the current user
 */
router.get('/', async (req, res) => {
    try {
        // MVP: Use default user (no auth)
        const userId = 'default-user';
        const reminders = reminderService_1.reminderService.getUserReminders(userId);
        res.json({
            success: true,
            data: reminders
        });
    }
    catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch reminders'
        });
    }
});
/**
 * GET /api/reminders/habit/:habitId
 * Get reminders for a specific habit
 */
router.get('/habit/:habitId', async (req, res) => {
    try {
        const { habitId } = req.params;
        const reminders = reminderService_1.reminderService.getHabitReminders(habitId);
        res.json({
            success: true,
            data: reminders
        });
    }
    catch (error) {
        console.error('Error fetching habit reminders:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch reminders'
        });
    }
});
/**
 * POST /api/reminders
 * Create a new reminder
 */
router.post('/', async (req, res) => {
    try {
        const { habitId, time, frequency, channels, daysOfWeek } = req.body;
        // Validation
        if (!habitId) {
            return res.status(400).json({
                success: false,
                error: 'habitId is required'
            });
        }
        if (!time) {
            return res.status(400).json({
                success: false,
                error: 'time is required (format: HH:MM)'
            });
        }
        if (!frequency || !['daily', 'weekdays', 'weekends', 'custom'].includes(frequency)) {
            return res.status(400).json({
                success: false,
                error: 'frequency must be one of: daily, weekdays, weekends, custom'
            });
        }
        if (!channels || !Array.isArray(channels) || channels.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one channel is required (sms, telegram, whatsapp)'
            });
        }
        // Validate channels
        const validChannels = ['sms', 'telegram', 'whatsapp'];
        const invalidChannels = channels.filter(c => !validChannels.includes(c));
        if (invalidChannels.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Invalid channels: ${invalidChannels.join(', ')}`
            });
        }
        // MVP: Use default user (no auth)
        const userId = 'default-user';
        const reminder = reminderService_1.reminderService.createReminder(habitId, userId, time, frequency, channels, daysOfWeek);
        res.status(201).json({
            success: true,
            data: reminder
        });
    }
    catch (error) {
        console.error('Error creating reminder:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create reminder'
        });
    }
});
/**
 * PUT /api/reminders/:id
 * Update a reminder
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { time, frequency, channels, daysOfWeek, isActive } = req.body;
        const updates = {};
        if (time !== undefined)
            updates.time = time;
        if (frequency !== undefined)
            updates.frequency = frequency;
        if (channels !== undefined)
            updates.channels = channels;
        if (daysOfWeek !== undefined)
            updates.daysOfWeek = daysOfWeek;
        if (isActive !== undefined)
            updates.isActive = isActive;
        const reminder = reminderService_1.reminderService.updateReminder(id, updates);
        res.json({
            success: true,
            data: reminder
        });
    }
    catch (error) {
        console.error('Error updating reminder:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update reminder'
        });
    }
});
/**
 * DELETE /api/reminders/:id
 * Delete a reminder
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = reminderService_1.reminderService.deleteReminder(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Reminder not found'
            });
        }
        res.json({
            success: true,
            message: 'Reminder deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete reminder'
        });
    }
});
/**
 * POST /api/reminders/:id/toggle
 * Toggle reminder active status
 */
router.post('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = reminderService_1.reminderService.toggleReminder(id);
        res.json({
            success: true,
            data: reminder
        });
    }
    catch (error) {
        console.error('Error toggling reminder:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle reminder'
        });
    }
});
/**
 * POST /api/reminders/:id/test
 * Send a test reminder immediately
 */
router.post('/:id/test', async (req, res) => {
    try {
        const { id } = req.params;
        await reminderService_1.reminderService.sendTestReminder(id);
        res.json({
            success: true,
            message: 'Test reminder sent'
        });
    }
    catch (error) {
        console.error('Error sending test reminder:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send test reminder'
        });
    }
});
/**
 * GET /api/reminders/status
 * Get reminder service status
 */
router.get('/status', async (req, res) => {
    try {
        const status = reminderService_1.reminderService.getStatus();
        const connectivity = await messagingService_1.messagingService.testConnectivity();
        res.json({
            success: true,
            data: {
                ...status,
                messaging: connectivity
            }
        });
    }
    catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch status'
        });
    }
});
exports.default = router;
