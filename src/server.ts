import express from 'express';
import path from 'path';
import { habits, addHabit, markHabitComplete, getHabitProgress } from './data-store';
import { scheduleReminders } from './reminders';
import { calculateStreak } from './utils/streaks';
import { generateChartData } from './utils/charts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all habits
app.get('/api/habits', (req, res) => {
  res.json(habits);
});

// Create a new habit
app.post('/api/habits', (req, res) => {
  const { name, reminderTime, reminderChannels } = req.body;

  if (!name || !reminderTime || !reminderChannels) {
    return res.status(400).json({ error: 'Name, reminderTime, and reminderChannels are required' });
  }

  try {
    const habit = addHabit(name, reminderTime, reminderChannels);
    scheduleReminders(); // Re-schedule all reminders
    res.status(201).json(habit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Mark habit as complete for today
app.post('/api/habits/:id/complete', (req, res) => {
  const habitId = parseInt(req.params.id, 10);
  const habit = habits.find(h => h.id === habitId);

  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  markHabitComplete(habitId);
  const streak = calculateStreak(habitId);
  res.json({ success: true, streak });
});

// Get progress data for chart
app.get('/api/habits/:id/progress', (req, res) => {
  const habitId = parseInt(req.params.id, 10);
  const habit = habits.find(h => h.id === habitId);

  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  const progress = getHabitProgress(habitId);
  const chartData = generateChartData(progress);
  res.json(chartData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  scheduleReminders(); // Start reminder scheduler
});

export default app;