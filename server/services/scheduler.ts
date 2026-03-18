import cron from 'node-cron';
import { DateTime } from 'luxon';
import * as habitModel from '../models/habit';
import * as userModel from '../models/user';
import * as messaging from './messaging';
import { query } from '../database';

interface ScheduledJob {
  habitId: number;
  task: cron.ScheduledTask;
}

const scheduledJobs = new Map<number, ScheduledJob[]>();

export async function initializeScheduler(): Promise<void> {
  console.log('Initializing habit reminder scheduler...');
  
  // Load all active habits and schedule reminders
  const habits = await habitModel.getAllActiveHabits();
  
  for (const habit of habits) {
    await scheduleHabitReminders(habit);
  }
  
  console.log(`Scheduler initialized with ${habits.length} active habits`);
}

export async function scheduleHabitReminders(habit: habitModel.Habit): Promise<void> {
  // Cancel existing reminders for this habit
  cancelHabitReminders(habit.id);
  
  const user = await userModel.findUserById(habit.user_id);
  if (!user) {
    console.error(`User not found for habit ${habit.id}`);
    return;
  }

  const jobs: ScheduledJob[] = [];

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

function scheduleDailyReminder(habit: habitModel.Habit, user: userModel.User): ScheduledJob {
  // Schedule at 9 AM in user's timezone
  const task = cron.schedule('0 9 * * *', async () => {
    await sendReminder(habit, user);
  }, {
    timezone: user.timezone,
  });

  return { habitId: habit.id, task };
}

function scheduleEveryNDaysReminder(habit: habitModel.Habit, user: userModel.User, days: number): ScheduledJob {
  // Check every day at 9 AM if reminder should be sent
  const task = cron.schedule('0 9 * * *', async () => {
    const lastCompletion = habit.last_completed_date;
    if (!lastCompletion) {
      await sendReminder(habit, user);
      return;
    }

    const now = DateTime.now().setZone(user.timezone);
    const lastCompletionDate = DateTime.fromJSDate(new Date(lastCompletion)).setZone(user.timezone);
    const daysSinceCompletion = now.diff(lastCompletionDate, 'days').days;

    if (daysSinceCompletion >= days) {
      await sendReminder(habit, user);
    }
  }, {
    timezone: user.timezone,
  });

  return { habitId: habit.id, task };
}

function scheduleWeeklyReminder(habit: habitModel.Habit, user: userModel.User): ScheduledJob {
  // Schedule every Monday at 9 AM
  const task = cron.schedule('0 9 * * 1', async () => {
    await sendReminder(habit, user);
  }, {
    timezone: user.timezone,
  });

  return { habitId: habit.id, task };
}

function scheduleMonthlyReminder(habit: habitModel.Habit, user: userModel.User): ScheduledJob {
  // Schedule on the 1st of each month at 9 AM
  const task = cron.schedule('0 9 1 * *', async () => {
    await sendReminder(habit, user);
  }, {
    timezone: user.timezone,
  });

  return { habitId: habit.id, task };
}

function scheduleHourlyReminder(habit: habitModel.Habit, user: userModel.User, hours: number): ScheduledJob {
  const cronExpression = hours === 1 ? '0 * * * *' : `0 */${hours} * * *`;
  
  const task = cron.schedule(cronExpression, async () => {
    await sendReminder(habit, user);
  }, {
    timezone: user.timezone,
  });

  return { habitId: habit.id, task };
}

function scheduleCustomReminders(habit: habitModel.Habit, user: userModel.User): ScheduledJob[] {
  if (!habit.custom_times) {
    return [];
  }

  const jobs: ScheduledJob[] = [];
  let times: string[] = [];

  try {
    times = JSON.parse(habit.custom_times);
  } catch (error) {
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
    
    const task = cron.schedule(cronExpression, async () => {
      await sendReminder(habit, user);
    }, {
      timezone: user.timezone,
    });

    jobs.push({ habitId: habit.id, task });
  }

  return jobs;
}

async function sendReminder(habit: habitModel.Habit, user: userModel.User): Promise<void> {
  // Check if habit is still active
  const currentHabit = await habitModel.findHabitById(habit.id);
  if (!currentHabit || !currentHabit.is_active) {
    console.log(`Habit ${habit.id} is no longer active, skipping reminder`);
    cancelHabitReminders(habit.id);
    return;
  }

  // Check if already completed today
  const now = DateTime.now().setZone(user.timezone);
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
    await query(
      'INSERT INTO reminders (habit_id, user_id, scheduled_time, sent_at) VALUES ($1, $2, $3, $4)',
      [habit.id, user.id, now.toJSDate(), now.toJSDate()]
    );
    console.log(`Reminder sent for habit ${habit.id} to user ${user.id}`);
  } else {
    console.error(`Failed to send reminder for habit ${habit.id}`);
  }
}

export function cancelHabitReminders(habitId: number): void {
  const jobs = scheduledJobs.get(habitId);
  
  if (jobs) {
    for (const job of jobs) {
      job.task.stop();
    }
    scheduledJobs.delete(habitId);
    console.log(`Cancelled all reminders for habit ${habitId}`);
  }
}

export function cancelAllReminders(): void {
  for (const [habitId, jobs] of scheduledJobs.entries()) {
    for (const job of jobs) {
      job.task.stop();
    }
  }
  scheduledJobs.clear();
  console.log('Cancelled all scheduled reminders');
}

export default {
  initializeScheduler,
  scheduleHabitReminders,
  cancelHabitReminders,
  cancelAllReminders,
};
