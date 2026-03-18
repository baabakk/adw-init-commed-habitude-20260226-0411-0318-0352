import { DateTime } from 'luxon';
import * as habitModel from '../models/habit';
import * as userModel from '../models/user';
import * as messaging from './messaging';
import * as scheduler from './scheduler';
import config from '../config';

export interface CreateHabitParams {
  userId: number;
  name: string;
  goal?: string;
  frequency: habitModel.HabitFrequency;
  customTimes?: string[];
}

export async function createHabit(params: CreateHabitParams): Promise<{ success: boolean; habit?: habitModel.Habit; error?: string }> {
  // Check habit limit
  const habitCount = await habitModel.countActiveHabits(params.userId);
  if (habitCount >= config.habits.maxPerUser) {
    return {
      success: false,
      error: `Maximum ${config.habits.maxPerUser} habits allowed per user`,
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

    if (params.customTimes.length > config.habits.maxCustomTimes) {
      return {
        success: false,
        error: `Maximum ${config.habits.maxCustomTimes} custom times allowed`,
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
  } catch (error) {
    console.error('Failed to create habit:', error);
    return {
      success: false,
      error: 'Failed to create habit',
    };
  }
}

export async function completeHabitForToday(
  habitId: number,
  userId: number,
  method: 'web' | 'sms' | 'telegram' | 'whatsapp'
): Promise<{ success: boolean; streak?: number; error?: string }> {
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
  const now = DateTime.now().setZone(user.timezone);
  const today = now.toISODate();

  // Complete the habit
  const completion = await habitModel.completeHabit(
    habitId,
    userId,
    new Date(today),
    method
  );

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

async function calculateStreak(habitId: number, timezone: string): Promise<{ current: number; longest: number }> {
  const habit = await habitModel.findHabitById(habitId);
  if (!habit) {
    return { current: 0, longest: 0 };
  }

  // Get all completions
  const completions = await habitModel.getCompletions(habitId, 365);
  
  if (completions.length === 0) {
    return { current: 0, longest: 0 };
  }

  const now = DateTime.now().setZone(timezone);
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkDate = now.startOf('day');

  // Sort completions by date descending
  const sortedCompletions = completions.sort((a, b) => 
    new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
  );

  // Calculate current streak
  for (const completion of sortedCompletions) {
    const completionDate = DateTime.fromJSDate(new Date(completion.completion_date)).setZone(timezone).startOf('day');
    
    if (completionDate.equals(checkDate)) {
      currentStreak++;
      checkDate = checkDate.minus({ days: 1 });
    } else {
      break;
    }
  }

  // Calculate longest streak
  const allDates = sortedCompletions.map(c => 
    DateTime.fromJSDate(new Date(c.completion_date)).setZone(timezone).startOf('day')
  ).reverse();

  for (let i = 0; i < allDates.length; i++) {
    tempStreak = 1;
    
    for (let j = i + 1; j < allDates.length; j++) {
      const diff = allDates[j].diff(allDates[j - 1], 'days').days;
      
      if (diff === 1) {
        tempStreak++;
      } else {
        break;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
}

export async function getHabitStats(habitId: number, userId: number): Promise<any> {
  const habit = await habitModel.findHabitById(habitId);
  
  if (!habit || habit.user_id !== userId) {
    return null;
  }

  const user = await userModel.findUserById(userId);
  if (!user) {
    return null;
  }

  // Get completions for the last 30 days
  const now = DateTime.now().setZone(user.timezone);
  const startDate = now.minus({ days: 30 }).toJSDate();
  const endDate = now.toJSDate();

  const completions = await habitModel.getCompletionsByDateRange(habitId, startDate, endDate);

  // Build completion map
  const completionMap: { [key: string]: boolean } = {};
  for (const completion of completions) {
    const date = DateTime.fromJSDate(new Date(completion.completion_date)).toISODate();
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

export async function stopHabit(habitId: number, userId: number): Promise<{ success: boolean; error?: string }> {
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

export async function deleteHabit(habitId: number, userId: number): Promise<{ success: boolean; error?: string }> {
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

export default {
  createHabit,
  completeHabitForToday,
  getHabitStats,
  stopHabit,
  deleteHabit,
};
