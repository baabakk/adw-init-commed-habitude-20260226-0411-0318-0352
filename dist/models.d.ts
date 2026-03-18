export interface User {
    id: string;
    name: string;
    phoneNumber?: string;
    telegramId?: string;
    whatsappNumber?: string;
    timezone: string;
    createdAt: Date;
}
export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    goal?: string;
    createdAt: Date;
    isActive: boolean;
}
export interface Reminder {
    id: string;
    habitId: string;
    userId: string;
    time: string;
    frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
    daysOfWeek?: number[];
    channels: ('sms' | 'telegram' | 'whatsapp')[];
    isActive: boolean;
    createdAt: Date;
}
export interface Completion {
    id: string;
    habitId: string;
    userId: string;
    completedAt: Date;
    date: string;
}
export interface Streak {
    habitId: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate: string;
}
export interface ProgressData {
    habitId: string;
    habitName: string;
    completions: {
        date: string;
        completed: boolean;
    }[];
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
}
export interface NotificationPayload {
    userId: string;
    habitId: string;
    habitName: string;
    message: string;
    channels: ('sms' | 'telegram' | 'whatsapp')[];
}
