export interface Habit {
  id: string;
  name: string;
  description?: string;
  currentStreak: number;
  lastCompleted?: string;
  completedToday: boolean;
  goals?: {
    target: number;
    unit: string;
    deadline?: string;
  }[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  telegramId?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}