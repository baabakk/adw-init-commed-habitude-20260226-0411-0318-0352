export declare class User {
    id: string;
    email: string;
    password: string;
    phoneNumber?: string;
    telegramId?: string;
    timezone?: string;
    habits: Habit[];
    reminders: Reminder[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class Habit {
    id: string;
    name: string;
    description?: string;
    currentStreak: number;
    lastCompleted?: Date;
    completedToday: boolean;
    goals?: {
        target: number;
        unit: string;
        deadline?: Date;
    }[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Reminder {
    id: string;
    time: string;
    days: string[];
    channels: ('sms' | 'telegram' | 'whatsapp')[];
    habitId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class HabitCompletion {
    id: string;
    habitId: string;
    userId: string;
    completedAt: Date;
    notes?: string;
    createdAt: Date;
}
