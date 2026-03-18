import { EventEmitter } from 'events';

export type HabitCompletedEvent = {
  userId: string;
  habitId: string;
  completedAt: Date;
};

class AppEventEmitter extends EventEmitter {}

export const eventBus = new AppEventEmitter();

export const EVENTS = {
  HABIT_COMPLETED: 'HabitCompleted'
} as const;
