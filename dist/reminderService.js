"use strict";
/**
 * Reminder scheduling and notification dispatch service
 *
 * PRODUCTION NOTES:
 * - Uses setInterval for MVP; production should use node-cron or Bull queue
 * - No timezone conversion implemented; assumes server timezone
 * - No persistence of scheduled jobs across restarts
 * - Consider using a job queue (Bull, Agenda) for production
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderService = exports.ReminderService = void 0;
const database_1 = require("./database");
const messagingService_1 = require("./messagingService");
const habitService_1 = require("./habitService");
class ReminderService {
    constructor() {
        this.checkInterval = null;
        this.CHECK_FREQUENCY_MS = 60000; // Check every minute
    }
    /**
     * Start the reminder scheduler
     */
    start() {
        if (this.checkInterval) {
            console.log('Reminder service already running');
            return;
        }
        console.log('Starting reminder service...');
        // Check immediately on start
        this.checkAndSendReminders();
        // Then check every minute
        this.checkInterval = setInterval(() => {
            this.checkAndSendReminders();
        }, this.CHECK_FREQUENCY_MS);
        console.log('Reminder service started');
    }
    /**
     * Stop the reminder scheduler
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Reminder service stopped');
        }
    }
    /**
     * Check for due reminders and send notifications
     */
    async checkAndSendReminders() {
        try {
            const now = new Date();
            const currentTime = this.formatTime(now);
            const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
            const activeReminders = database_1.db.getAllActiveReminders();
            for (const reminder of activeReminders) {
                if (this.shouldSendReminder(reminder, currentTime, currentDay)) {
                    await this.sendReminder(reminder);
                }
            }
        }
        catch (error) {
            console.error('Error checking reminders:', error);
        }
    }
    /**
     * Determine if a reminder should be sent now
     */
    shouldSendReminder(reminder, currentTime, currentDay) {
        // Check if time matches (within the same minute)
        if (reminder.time !== currentTime) {
            return false;
        }
        // Check frequency
        switch (reminder.frequency) {
            case 'daily':
                return true;
            case 'weekdays':
                return currentDay >= 1 && currentDay <= 5; // Monday-Friday
            case 'weekends':
                return currentDay === 0 || currentDay === 6; // Saturday-Sunday
            case 'custom':
                return reminder.daysOfWeek?.includes(currentDay) ?? false;
            default:
                return false;
        }
    }
    /**
     * Send a reminder notification
     */
    async sendReminder(reminder) {
        try {
            const habit = database_1.db.getHabit(reminder.habitId);
            if (!habit || !habit.isActive) {
                console.log(`Skipping reminder for inactive habit: ${reminder.habitId}`);
                return;
            }
            console.log(`Sending reminder for habit: ${habit.name}`);
            await messagingService_1.messagingService.sendHabitReminder(reminder.userId, reminder.habitId, habit.name, reminder.channels);
        }
        catch (error) {
            console.error(`Failed to send reminder ${reminder.id}:`, error);
        }
    }
    /**
     * Create a new reminder
     */
    createReminder(habitId, userId, time, frequency, channels, daysOfWeek) {
        // Validate time format
        if (!this.isValidTimeFormat(time)) {
            throw new Error('Invalid time format. Use HH:MM (24-hour format)');
        }
        // Validate habit exists
        const habit = database_1.db.getHabit(habitId);
        if (!habit) {
            throw new Error('Habit not found');
        }
        // Validate user owns the habit
        if (habit.userId !== userId) {
            throw new Error('Unauthorized');
        }
        // Validate channels
        if (channels.length === 0) {
            throw new Error('At least one notification channel is required');
        }
        // Validate custom frequency
        if (frequency === 'custom' && (!daysOfWeek || daysOfWeek.length === 0)) {
            throw new Error('Custom frequency requires daysOfWeek to be specified');
        }
        const reminder = {
            id: this.generateId(),
            habitId,
            userId,
            time,
            frequency,
            daysOfWeek,
            channels,
            isActive: true,
            createdAt: new Date()
        };
        return database_1.db.createReminder(reminder);
    }
    /**
     * Update a reminder
     */
    updateReminder(reminderId, updates) {
        const reminder = database_1.db.getReminder(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }
        // Validate time format if being updated
        if (updates.time && !this.isValidTimeFormat(updates.time)) {
            throw new Error('Invalid time format. Use HH:MM (24-hour format)');
        }
        // Prevent changing userId or habitId
        delete updates.userId;
        delete updates.habitId;
        delete updates.id;
        const updated = database_1.db.updateReminder(reminderId, updates);
        if (!updated) {
            throw new Error('Failed to update reminder');
        }
        return updated;
    }
    /**
     * Delete a reminder
     */
    deleteReminder(reminderId) {
        return database_1.db.deleteReminder(reminderId);
    }
    /**
     * Get reminders for a habit
     */
    getHabitReminders(habitId) {
        return database_1.db.getRemindersByHabit(habitId);
    }
    /**
     * Get all reminders for a user
     */
    getUserReminders(userId) {
        return database_1.db.getRemindersByUser(userId);
    }
    /**
     * Toggle reminder active status
     */
    toggleReminder(reminderId) {
        const reminder = database_1.db.getReminder(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }
        const updated = database_1.db.updateReminder(reminderId, { isActive: !reminder.isActive });
        if (!updated) {
            throw new Error('Failed to toggle reminder');
        }
        return updated;
    }
    /**
     * Send a test reminder immediately
     */
    async sendTestReminder(reminderId) {
        const reminder = database_1.db.getReminder(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }
        await this.sendReminder(reminder);
    }
    /**
     * Check if a habit should send a streak notification
     */
    async checkStreakNotification(habitId) {
        try {
            const habit = database_1.db.getHabit(habitId);
            if (!habit) {
                return;
            }
            if (habitService_1.habitService.shouldSendStreakNotification(habitId)) {
                const streak = habitService_1.habitService.getStreak(habitId);
                const reminders = database_1.db.getRemindersByHabit(habitId);
                // Get all unique channels from habit reminders
                const channels = new Set();
                reminders.forEach(r => r.channels.forEach(c => channels.add(c)));
                if (channels.size > 0) {
                    await messagingService_1.messagingService.sendStreakNotification(habit.userId, habitId, habit.name, streak.currentStreak, Array.from(channels));
                }
            }
        }
        catch (error) {
            console.error('Error checking streak notification:', error);
        }
    }
    /**
     * Format time as HH:MM
     */
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    /**
     * Validate time format (HH:MM)
     */
    isValidTimeFormat(time) {
        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        return timeRegex.test(time);
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get service status
     */
    getStatus() {
        return {
            running: this.checkInterval !== null,
            activeReminders: database_1.db.getAllActiveReminders().length
        };
    }
}
exports.ReminderService = ReminderService;
exports.reminderService = new ReminderService();
