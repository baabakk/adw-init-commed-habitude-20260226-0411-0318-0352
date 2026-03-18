"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHabit = createHabit;
exports.completeHabitForToday = completeHabitForToday;
exports.getHabitStats = getHabitStats;
exports.stopHabit = stopHabit;
exports.deleteHabit = deleteHabit;
const luxon_1 = require("luxon");
const habitModel = __importStar(require("../models/habit"));
const userModel = __importStar(require("../models/user"));
const messaging = __importStar(require("./messaging"));
const scheduler = __importStar(require("./scheduler"));
const config_1 = __importDefault(require("../config"));
async function createHabit(params) {
    // Check habit limit
    const habitCount = await habitModel.countActiveHabits(params.userId);
    if (habitCount >= config_1.default.habits.maxPerUser) {
        return {
            success: false,
            error: `Maximum ${config_1.default.habits.maxPerUser} habits allowed per user`,
        };
    }
    // Validate custom times
    if (params.frequency === 'custom') {
        if (!params.customTimes || params.customTimes.length === 0) {
            return {
                success: false,
                error: 'Custom times are required for custom frequency',
            };
        }
        if (params.customTimes.length > config_1.default.habits.maxCustomTimes) {
            return {
                success: false,
                error: `Maximum ${config_1.default.habits.maxCustomTimes} custom times allowed`,
            };
        }
        // Validate time format
        for (const time of params.customTimes) {
            if (!/^\d{2}:\d{2}$/.test(time)) {
                return {
                    success: false,
                    error: 'Invalid time format. Use HH:mm format (e.g., 09:30)',
                };
            }
        }
    }
    try {
        const habit = await habitModel.createHabit({
            user_id: params.userId,
            name: params.name,
            goal: params.goal,
            frequency: params.frequency,
            custom_times: params.customTimes,
        });
        // Schedule reminders
        await scheduler.scheduleHabitReminders(habit);
        return { success: true, habit };
    }
    catch (error) {
        console.error('Failed to create habit:', error);
        return {
            success: false,
            error: 'Failed to create habit',
        };
    }
}
async function completeHabitForToday(habitId, userId, method) {
    const habit = await habitModel.findHabitById(habitId);
    if (!habit) {
        return { success: false, error: 'Habit not found' };
    }
    if (habit.user_id !== userId) {
        return { success: false, error: 'Unauthorized' };
    }
    if (!habit.is_active) {
        return { success: false, error: 'Habit is not active' };
    }
    // Get user for timezone
    const user = await userModel.findUserById(userId);
    if (!user) {
        return { success: false, error: 'User not found' };
    }
    // Get current date in user's timezone
    const now = luxon_1.DateTime.now().setZone(user.timezone);
    const today = now.toISODate();
    // Complete the habit
    const completion = await habitModel.completeHabit(habitId, userId, new Date(today), method);
    if (!completion) {
        return { success: false, error: 'Habit already completed today' };
    }
    // Calculate streak
    const streak = await calculateStreak(habitId, user.timezone);
    await habitModel.updateStreak(habitId, streak.current, streak.longest);
    // Send streak notification if milestone reached
    if (streak.current > 0 && streak.current % 3 === 0) {
        const streakMessage = messaging.formatStreakNotification(habit.name, streak.current);
        await messaging.sendMessage({
            channel: user.messaging_channel,
            recipient: user.channel_identifier,
            message: streakMessage,
        });
    }
    return { success: true, streak: streak.current };
}
async function calculateStreak(habitId, timezone) {
    const habit = await habitModel.findHabitById(habitId);
    if (!habit) {
        return { current: 0, longest: 0 };
    }
    // Get all completions
    const completions = await habitModel.getCompletions(habitId, 365);
    if (completions.length === 0) {
        return { current: 0, longest: 0 };
    }
    const now = luxon_1.DateTime.now().setZone(timezone);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = now.startOf('day');
    // Sort completions by date descending
    const sortedCompletions = completions.sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());
    // Calculate current streak
    for (const completion of sortedCompletions) {
        const completionDate = luxon_1.DateTime.fromJSDate(new Date(completion.completion_date)).setZone(timezone).startOf('day');
        if (completionDate.equals(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minus({ days: 1 });
        }
        else {
            break;
        }
    }
    // Calculate longest streak
    const allDates = sortedCompletions.map(c => luxon_1.DateTime.fromJSDate(new Date(c.completion_date)).setZone(timezone).startOf('day')).reverse();
    for (let i = 0; i < allDates.length; i++) {
        tempStreak = 1;
        for (let j = i + 1; j < allDates.length; j++) {
            const diff = allDates[j].diff(allDates[j - 1], 'days').days;
            if (diff === 1) {
                tempStreak++;
            }
            else {
                break;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    return { current: currentStreak, longest: longestStreak };
}
async function getHabitStats(habitId, userId) {
    const habit = await habitModel.findHabitById(habitId);
    if (!habit || habit.user_id !== userId) {
        return null;
    }
    const user = await userModel.findUserById(userId);
    if (!user) {
        return null;
    }
    // Get completions for the last 30 days
    const now = luxon_1.DateTime.now().setZone(user.timezone);
    const startDate = now.minus({ days: 30 }).toJSDate();
    const endDate = now.toJSDate();
    const completions = await habitModel.getCompletionsByDateRange(habitId, startDate, endDate);
    // Build completion map
    const completionMap = {};
    for (const completion of completions) {
        const date = luxon_1.DateTime.fromJSDate(new Date(completion.completion_date)).toISODate();
        completionMap[date] = true;
    }
    // Build 30-day array
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
        const date = now.minus({ days: i });
        last30Days.push({
            date: date.toISODate(),
            completed: completionMap[date.toISODate()] || false,
        });
    }
    return {
        habit,
        completions: last30Days,
        currentStreak: habit.current_streak,
        longestStreak: habit.longest_streak,
        totalCompletions: completions.length,
    };
}
async function stopHabit(habitId, userId) {
    const habit = await habitModel.findHabitById(habitId);
    if (!habit) {
        return { success: false, error: 'Habit not found' };
    }
    if (habit.user_id !== userId) {
        return { success: false, error: 'Unauthorized' };
    }
    // Stop the habit
    await habitModel.stopHabit(habitId);
    // Cancel all reminders
    scheduler.cancelHabitReminders(habitId);
    return { success: true };
}
async function deleteHabit(habitId, userId) {
    const habit = await habitModel.findHabitById(habitId);
    if (!habit) {
        return { success: false, error: 'Habit not found' };
    }
    if (habit.user_id !== userId) {
        return { success: false, error: 'Unauthorized' };
    }
    // Cancel all reminders first
    scheduler.cancelHabitReminders(habitId);
    // Delete the habit
    await habitModel.deleteHabit(habitId);
    return { success: true };
}
exports.default = {
    createHabit,
    completeHabitForToday,
    getHabitStats,
    stopHabit,
    deleteHabit,
};
//# sourceMappingURL=habits.js.map