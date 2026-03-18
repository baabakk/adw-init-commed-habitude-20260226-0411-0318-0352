import { query } from '../database';

export type HabitFrequency = 'daily' | 'every_2_days' | 'weekly' | 'monthly' | 'hourly_1' | 'hourly_6' | 'custom';

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  goal?: string;
  frequency: HabitFrequency;
  custom_times?: string; // JSON string of time array
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  last_completed_date?: Date;
  created_at: Date;
  updated_at: Date;
  stopped_at?: Date;
}

export interface CreateHabitData {
  user_id: number;
  name: string;
  goal?: string;
  frequency: HabitFrequency;
  custom_times?: string[];
}

export interface Completion {
  id: number;
  habit_id: number;
  user_id: number;
  completion_date: Date;
  completed_at: Date;
  completion_method: 'web' | 'sms' | 'telegram' | 'whatsapp';
}

export async function createHabit(data: CreateHabitData): Promise<Habit> {
  const customTimesJson = data.custom_times ? JSON.stringify(data.custom_times) : null;
  
  const result = await query(
    `INSERT INTO habits (user_id, name, goal, frequency, custom_times, current_streak, longest_streak, is_active)
     VALUES ($1, $2, $3, $4, $5, 0, 0, true)
     RETURNING *`,
    [data.user_id, data.name, data.goal || null, data.frequency, customTimesJson]
  );
  return result.rows[0];
}

export async function findHabitsByUserId(userId: number): Promise<Habit[]> {
  const result = await query(
    'SELECT * FROM habits WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function findHabitById(habitId: number): Promise<Habit | null> {
  const result = await query(
    'SELECT * FROM habits WHERE id = $1',
    [habitId]
  );
  return result.rows[0] || null;
}

export async function countActiveHabits(userId: number): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) as count FROM habits WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function stopHabit(habitId: number): Promise<void> {
  await query(
    'UPDATE habits SET is_active = false, stopped_at = NOW() WHERE id = $1',
    [habitId]
  );
}

export async function deleteHabit(habitId: number): Promise<void> {
  await query('DELETE FROM habits WHERE id = $1', [habitId]);
}

export async function completeHabit(
  habitId: number,
  userId: number,
  completionDate: Date,
  method: 'web' | 'sms' | 'telegram' | 'whatsapp'
): Promise<Completion | null> {
  try {
    const result = await query(
      `INSERT INTO completions (habit_id, user_id, completion_date, completion_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [habitId, userId, completionDate, method]
    );
    return result.rows[0];
  } catch (error: any) {
    // Handle unique constraint violation (duplicate completion)
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }
}

export async function updateStreak(habitId: number, currentStreak: number, longestStreak: number): Promise<void> {
  await query(
    'UPDATE habits SET current_streak = $1, longest_streak = $2, last_completed_date = CURRENT_DATE WHERE id = $3',
    [currentStreak, longestStreak, habitId]
  );
}

export async function getCompletions(habitId: number, limit: number = 30): Promise<Completion[]> {
  const result = await query(
    `SELECT * FROM completions 
     WHERE habit_id = $1 
     ORDER BY completion_date DESC 
     LIMIT $2`,
    [habitId, limit]
  );
  return result.rows;
}

export async function getCompletionsByDateRange(
  habitId: number,
  startDate: Date,
  endDate: Date
): Promise<Completion[]> {
  const result = await query(
    `SELECT * FROM completions 
     WHERE habit_id = $1 
     AND completion_date >= $2 
     AND completion_date <= $3
     ORDER BY completion_date ASC`,
    [habitId, startDate, endDate]
  );
  return result.rows;
}

export async function hasCompletionForDate(habitId: number, date: Date): Promise<boolean> {
  const result = await query(
    'SELECT id FROM completions WHERE habit_id = $1 AND completion_date = $2',
    [habitId, date]
  );
  return result.rows.length > 0;
}

export async function getAllActiveHabits(): Promise<Habit[]> {
  const result = await query(
    'SELECT * FROM habits WHERE is_active = true ORDER BY user_id, created_at'
  );
  return result.rows;
}

export default {
  createHabit,
  findHabitsByUserId,
  findHabitById,
  countActiveHabits,
  stopHabit,
  deleteHabit,
  completeHabit,
  updateStreak,
  getCompletions,
  getCompletionsByDateRange,
  hasCompletionForDate,
  getAllActiveHabits,
};
