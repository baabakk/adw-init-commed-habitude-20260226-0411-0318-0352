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
exports.initializeScheduler = initializeScheduler;
exports.scheduleHabitReminders = scheduleHabitReminders;
exports.cancelHabitReminders = cancelHabitReminders;
exports.cancelAllReminders = cancelAllReminders;
const node_cron_1 = __importDefault(require("node-cron"));
const luxon_1 = require("luxon");
const habitModel = __importStar(require("../models/habit"));
const userModel = __importStar(require("../models/user"));
const messaging = __importStar(require("./messaging"));
const database_1 = require("../database");
const scheduledJobs = new Map();
async function initializeScheduler() {
    console.log('Initializing habit reminder scheduler...');
    // Load all active habits and schedule reminders
    const habits = await habitModel.getAllActiveHabits();
    for (const habit of habits) {
        await scheduleHabitReminders(habit);
    }
    console.log(`Scheduler initialized with ${habits.length} active habits`);
}
async function scheduleHabitReminders(habit) {
    // Cancel existing reminders for this habit
    cancelHabitReminders(habit.id);
    const user = await userModel.findUserById(habit.user_id);
    if (!user) {
        console.error(`User not found for habit ${habit.id}`);
        return;
    }
    const jobs = [];
    switch (habit.frequency) {
        case 'daily':
            jobs.push(scheduleDailyReminder(habit, user));
            break;
        case 'every_2_days':
            jobs.push(scheduleEveryNDaysReminder(habit, user, 2));
            break;
        case 'weekly':
            jobs.push(scheduleWeeklyReminder(habit, user));
            break;
        case 'monthly':
            jobs.push(scheduleMonthlyReminder(habit, user));
            break;
        case 'hourly_1':
            jobs.push(scheduleHourlyReminder(habit, user, 1));
            break;
        case 'hourly_6':
            jobs.push(scheduleHourlyReminder(habit, user, 6));
            break;
        case 'custom':
            jobs.push(...scheduleCustomReminders(habit, user));
            break;
    }
    if (jobs.length > 0) {
        scheduledJobs.set(habit.id, jobs);
    }
}
function scheduleDailyReminder(habit, user) {
    // Schedule at 9 AM in user's timezone
    const task = node_cron_1.default.schedule('0 9 * * *', async () => {
        await sendReminder(habit, user);
    }, {
        timezone: user.timezone,
    });
    return { habitId: habit.id, task };
}
function scheduleEveryNDaysReminder(habit, user, days) {
    // Check every day at 9 AM if reminder should be sent
    const task = node_cron_1.default.schedule('0 9 * * *', async () => {
        const lastCompletion = habit.last_completed_date;
        if (!lastCompletion) {
            await sendReminder(habit, user);
            return;
        }
        const now = luxon_1.DateTime.now().setZone(user.timezone);
        const lastCompletionDate = luxon_1.DateTime.fromJSDate(new Date(lastCompletion)).setZone(user.timezone);
        const daysSinceCompletion = now.diff(lastCompletionDate, 'days').days;
        if (daysSinceCompletion >= days) {
            await sendReminder(habit, user);
        }
    }, {
        timezone: user.timezone,
    });
    return { habitId: habit.id, task };
}
function scheduleWeeklyReminder(habit, user) {
    // Schedule every Monday at 9 AM
    const task = node_cron_1.default.schedule('0 9 * * 1', async () => {
        await sendReminder(habit, user);
    }, {
        timezone: user.timezone,
    });
    return { habitId: habit.id, task };
}
function scheduleMonthlyReminder(habit, user) {
    // Schedule on the 1st of each month at 9 AM
    const task = node_cron_1.default.schedule('0 9 1 * *', async () => {
        await sendReminder(habit, user);
    }, {
        timezone: user.timezone,
    });
    return { habitId: habit.id, task };
}
function scheduleHourlyReminder(habit, user, hours) {
    const cronExpression = hours === 1 ? '0 * * * *' : `0 */${hours} * * *`;
    const task = node_cron_1.default.schedule(cronExpression, async () => {
        await sendReminder(habit, user);
    }, {
        timezone: user.timezone,
    });
    return { habitId: habit.id, task };
}
function scheduleCustomReminders(habit, user) {
    if (!habit.custom_times) {
        return [];
    }
    const jobs = [];
    let times = [];
    try {
        times = JSON.parse(habit.custom_times);
    }
    catch (error) {
        console.error('Failed to parse custom times:', error);
        return [];
    }
    for (const time of times) {
        // Parse time in HH:mm format
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            console.error('Invalid time format:', time);
            continue;
        }
        const cronExpression = `${minutes} ${hours} * * *`;
        const task = node_cron_1.default.schedule(cronExpression, async () => {
            await sendReminder(habit, user);
        }, {
            timezone: user.timezone,
        });
        jobs.push({ habitId: habit.id, task });
    }
    return jobs;
}
async function sendReminder(habit, user) {
    // Check if habit is still active
    const currentHabit = await habitModel.findHabitById(habit.id);
    if (!currentHabit || !currentHabit.is_active) {
        console.log(`Habit ${habit.id} is no longer active, skipping reminder`);
        cancelHabitReminders(habit.id);
        return;
    }
    // Check if already completed today
    const now = luxon_1.DateTime.now().setZone(user.timezone);
    const today = now.toISODate();
    const hasCompleted = await habitModel.hasCompletionForDate(habit.id, new Date(today));
    if (hasCompleted) {
        console.log(`Habit ${habit.id} already completed today, skipping reminder`);
        return;
    }
    const message = messaging.formatReminderMessage(habit.name, habit.id);
    const success = await messaging.sendMessage({
        channel: user.messaging_channel,
        recipient: user.channel_identifier,
        message,
    });
    if (success) {
        // Record reminder sent
        await (0, database_1.query)('INSERT INTO reminders (habit_id, user_id, scheduled_time, sent_at) VALUES ($1, $2, $3, $4)', [habit.id, user.id, now.toJSDate(), now.toJSDate()]);
        console.log(`Reminder sent for habit ${habit.id} to user ${user.id}`);
    }
    else {
        console.error(`Failed to send reminder for habit ${habit.id}`);
    }
}
function cancelHabitReminders(habitId) {
    const jobs = scheduledJobs.get(habitId);
    if (jobs) {
        for (const job of jobs) {
            job.task.stop();
        }
        scheduledJobs.delete(habitId);
        console.log(`Cancelled all reminders for habit ${habitId}`);
    }
}
function cancelAllReminders() {
    for (const [habitId, jobs] of scheduledJobs.entries()) {
        for (const job of jobs) {
            job.task.stop();
        }
    }
    scheduledJobs.clear();
    console.log('Cancelled all scheduled reminders');
}
exports.default = {
    initializeScheduler,
    scheduleHabitReminders,
    cancelHabitReminders,
    cancelAllReminders,
};
//# sourceMappingURL=scheduler.js.map