"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const habit_1 = require("../models/habit");
const user_1 = require("../models/user");
class ReminderScheduler {
    constructor(messagingGateway) {
        this.cronJob = null;
        this.isRunning = false;
        this.messagingGateway = messagingGateway;
    }
    start() {
        if (this.isRunning) {
            console.log('Reminder scheduler already running');
            return;
        }
        // Run every minute to check for reminders
        this.cronJob = node_cron_1.default.schedule('* * * * *', async () => {
            await this.checkAndSendReminders();
        });
        this.isRunning = true;
        console.log('Reminder scheduler started');
    }
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.isRunning = false;
        console.log('Reminder scheduler stopped');
    }
    async checkAndSendReminders() {
        try {
            const habits = await habit_1.HabitModel.getHabitsNeedingReminders();
            const now = new Date();
            const currentTime = this.formatTime(now);
            for (const habit of habits) {
                // Check if reminder time matches current time
                if (habit.reminder_time === currentTime) {
                    await this.sendReminder(habit);
                }
            }
        }
        catch (error) {
            console.error('Error checking reminders:', error);
        }
    }
    async sendReminder(habit) {
        try {
            // Get user information
            const user = await user_1.UserModel.findById(habit.user_id);
            if (!user) {
                console.error(`User not found for habit ${habit.id}`);
                return;
            }
            // Check if habit should be reminded today based on frequency
            if (!this.shouldSendReminderToday(habit)) {
                return;
            }
            // Get habit stats for personalized message
            const habitWithStats = await habit_1.HabitModel.getHabitWithStats(habit.id);
            // Create reminder message
            const message = this.createReminderMessage(habit, habitWithStats);
            // Send via preferred channel with fallback
            const result = await this.messagingGateway.sendMessageWithFallback(user.id, message, habit.preferred_channel, habit.id);
            if (result.success) {
                console.log(`Reminder sent for habit "${habit.name}" to user ${user.username} via ${result.channel}`);
                // Check for streak milestones and send congratulations
                if (habitWithStats && habitWithStats.current_streak && this.isStreakMilestone(habitWithStats.current_streak)) {
                    await this.sendStreakNotification(user.id, habit, habitWithStats.current_streak);
                }
            }
            else {
                console.error(`Failed to send reminder for habit "${habit.name}":`, result.error);
            }
        }
        catch (error) {
            console.error(`Error sending reminder for habit ${habit.id}:`, error);
        }
    }
    shouldSendReminderToday(habit) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        switch (habit.reminder_frequency) {
            case 'daily':
                return true;
            case 'weekdays':
                return dayOfWeek >= 1 && dayOfWeek <= 5;
            case 'weekends':
                return dayOfWeek === 0 || dayOfWeek === 6;
            case 'weekly':
                // Send on the same day of week as created
                const createdDate = new Date(habit.created_at);
                return dayOfWeek === createdDate.getDay();
            default:
                return true;
        }
    }
    createReminderMessage(habit, habitWithStats) {
        let message = `🔔 Reminder: ${habit.name}\n\n`;
        if (habit.description) {
            message += `${habit.description}\n\n`;
        }
        if (habitWithStats) {
            if (habitWithStats.current_streak > 0) {
                message += `🔥 Current streak: ${habitWithStats.current_streak} day${habitWithStats.current_streak !== 1 ? 's' : ''}!\n`;
            }
            if (habit.goal) {
                message += `🎯 Goal: ${habit.goal}\n`;
            }
        }
        message += `\nKeep up the great work! 💪`;
        return message;
    }
    isStreakMilestone(streak) {
        // Celebrate at 3, 7, 14, 30, 60, 90, 180, 365 days
        const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
        return milestones.includes(streak);
    }
    async sendStreakNotification(userId, habit, streak) {
        try {
            const message = this.createStreakMessage(habit.name, streak);
            await this.messagingGateway.sendMessageWithFallback(userId, message, habit.preferred_channel, habit.id);
            console.log(`Streak notification sent for habit "${habit.name}" (${streak} days)`);
        }
        catch (error) {
            console.error('Error sending streak notification:', error);
        }
    }
    createStreakMessage(habitName, streak) {
        let emoji = '🎉';
        let message = '';
        if (streak === 3) {
            emoji = '🌟';
            message = `${emoji} Awesome! You've completed "${habitName}" for 3 days in a row!\n\nYou're building a great habit. Keep it going!`;
        }
        else if (streak === 7) {
            emoji = '🏆';
            message = `${emoji} Amazing! One week streak for "${habitName}"!\n\nYou're on fire! 🔥`;
        }
        else if (streak === 14) {
            emoji = '💎';
            message = `${emoji} Incredible! Two weeks of "${habitName}"!\n\nYou're unstoppable!`;
        }
        else if (streak === 30) {
            emoji = '👑';
            message = `${emoji} LEGENDARY! 30-day streak for "${habitName}"!\n\nYou've officially made this a habit!`;
        }
        else if (streak >= 60) {
            emoji = '🚀';
            message = `${emoji} PHENOMENAL! ${streak}-day streak for "${habitName}"!\n\nYou're an inspiration!`;
        }
        else {
            message = `${emoji} Congratulations! ${streak}-day streak for "${habitName}"!\n\nKeep up the excellent work!`;
        }
        return message;
    }
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    isSchedulerRunning() {
        return this.isRunning;
    }
}
exports.ReminderScheduler = ReminderScheduler;
