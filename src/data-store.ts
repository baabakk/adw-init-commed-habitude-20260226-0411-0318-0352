import { v4 as uuidv4 } from 'uuid';

export interface Habit {
  id: number;
  name: string;
  reminderTime: string; // HH:mm format
  reminderChannels: ('sms' | 'telegram' | 'whatsapp')[];
  createdAt: Date;
}

export interface Completion {
  habitId: number;
  date: string; // YYYY-MM-DD
  completedAt: Date;
}

let habits: Habit[] = [];
let completions: Completion[] = [];
let currentId = 1;

export { habits, completions };

export function addHabit(
  name: string,
  reminderTime: string,
  reminderChannels: ('sms' | 'telegram' | 'whatsapp')[]
): Habit {
  // Validate input
  if (!name.trim()) {
    throw new Error('Habit name cannot be empty');
  }

  if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A habit with this name already exists');
  }

  const habit: Habit = {
    id: currentId++,
    name,
    reminderTime,
    reminderChannels,
    createdAt: new Date()
  };

  habits.push(habit);
  return habit;
}

export function markHabitComplete(habitId: number): void {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) {
    throw new Error('Habit not found');
  }

  const today = new Date().toISOString().split('T')[0];
  const existing = completions.find(c => c.habitId === habitId && c.date === today);

  if (existing) {
    // Update completion time if already completed today
    existing.completedAt = new Date();
  } else {
    // Add new completion
    completions.push({
      habitId,
      date: today,
      completedAt: new Date()
    });
  }
}

export function getHabitProgress(habitId: number): Completion[] {
  return completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getHabitById(habitId: number): Habit | undefined {
  return habits.find(h => h.id === habitId);
}