import { Router, Request, Response } from 'express';
import { HabitModel, HabitWithStreak } from '../models/habit';
import { UserModel } from '../models/user';
import { query } from '../database';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error-handler';

const router = Router();

// Cache for chart data
interface CacheEntry {
  data: any;
  timestamp: number;
}

const chartCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const entry = chartCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  chartCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  chartCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Get user progress summary
router.get('/user/:userId/summary', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const cacheKey = `summary_${userId}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const habits = await HabitModel.getHabitsWithStats(userId);

  const summary = {
    total_habits: habits.length,
    active_streaks: habits.filter((h: HabitWithStreak) => h.current_streak > 0).length,
    total_completions: habits.reduce((sum: number, h: HabitWithStreak) => sum + h.total_completions, 0),
    average_completion_rate: habits.length > 0
      ? habits.reduce((sum: number, h: HabitWithStreak) => sum + h.completion_rate, 0) / habits.length
      : 0,
    longest_streak: Math.max(...habits.map((h: HabitWithStreak) => h.longest_streak), 0),
    habits_with_stats: habits,
  };

  setCachedData(cacheKey, summary);
  res.json(summary);
}));

// Get habit completion chart data (30 days)
router.get('/habit/:habitId/chart', asyncHandler(async (req: Request, res: Response) => {
  const habitId = parseInt(req.params.habitId, 10);

  if (isNaN(habitId)) {
    throw new ValidationError('Invalid habit ID');
  }

  const habit = await HabitModel.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }

  const cacheKey = `chart_${habitId}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get last 30 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completions = await HabitModel.getCompletions(
    habitId,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  // Create a map of completed dates
  const completedDates = new Set(completions.map(c => c.completion_date));

  // Generate chart data for all 30 days
  const chartData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    chartData.unshift({
      date: dateStr,
      completed: completedDates.has(dateStr) ? 1 : 0,
      day_of_week: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }

  const result = {
    habit_id: habitId,
    habit_name: habit.name,
    period: '30_days',
    data: chartData,
  };

  setCachedData(cacheKey, result);
  res.json(result);
}));

// Get user completion heatmap
router.get('/user/:userId/heatmap', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const days = parseInt(req.query.days as string) || 90;

  const cacheKey = `heatmap_${userId}_${days}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Get all completions for user's habits in the date range
  const completions = await query<{ completion_date: string; count: number }>(
    `SELECT completion_date, COUNT(*) as count
     FROM habit_completions hc
     JOIN habits h ON hc.habit_id = h.id
     WHERE h.user_id = ?
     AND completion_date >= ?
     AND completion_date <= ?
     GROUP BY completion_date
     ORDER BY completion_date`,
    [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
  );

  const heatmapData = completions.map(c => ({
    date: c.completion_date,
    count: c.count,
  }));

  const result = {
    user_id: userId,
    period_days: days,
    data: heatmapData,
  };

  setCachedData(cacheKey, result);
  res.json(result);
}));

// Get completion trends
router.get('/user/:userId/trends', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const cacheKey = `trends_${userId}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get weekly completion counts for the last 12 weeks
  const weeks = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completions = await query<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM habit_completions hc
       JOIN habits h ON hc.habit_id = h.id
       WHERE h.user_id = ?
       AND completion_date >= ?
       AND completion_date < ?`,
      [userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    weeks.unshift({
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      completions: completions[0]?.count || 0,
    });
  }

  const result = {
    user_id: userId,
    period: '12_weeks',
    weekly_data: weeks,
  };

  setCachedData(cacheKey, result);
  res.json(result);
}));

// Get leaderboard (top streaks across all users)
router.get('/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const cacheKey = `leaderboard_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const habits = await HabitModel.findAll();
  const habitsWithStats = await Promise.all(
    habits.map(h => HabitModel.getHabitWithStats(h.id))
  );

  const validHabits = habitsWithStats.filter(h => h !== undefined) as HabitWithStreak[];

  // Sort by current streak
  const topStreaks = validHabits
    .sort((a, b) => b.current_streak - a.current_streak)
    .slice(0, limit);

  // Get user info for each habit
  const leaderboard = await Promise.all(
    topStreaks.map(async (habit) => {
      const user = await UserModel.findById(habit.user_id);
      return {
        habit_name: habit.name,
        username: user?.username || 'Unknown',
        current_streak: habit.current_streak,
        total_completions: habit.total_completions,
      };
    })
  );

  setCachedData(cacheKey, leaderboard);
  res.json(leaderboard);
}));

// Get messaging delivery statistics
router.get('/user/:userId/messaging-stats', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const stats = await query<{ channel: string; status: string; count: number }>(
    `SELECT channel, status, COUNT(*) as count
     FROM message_delivery_log
     WHERE user_id = ?
     GROUP BY channel, status`,
    [userId]
  );

  const result = {
    user_id: userId,
    delivery_stats: stats,
  };

  res.json(result);
}));

export default router;
