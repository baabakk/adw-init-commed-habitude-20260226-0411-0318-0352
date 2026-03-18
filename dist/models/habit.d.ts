export interface Habit {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    goal?: string;
    reminder_time?: string;
    reminder_frequency: string;
    reminder_enabled: number;
    preferred_channel: string;
    created_at: string;
    updated_at: string;
}
export interface HabitCompletion {
    id: number;
    habit_id: number;
    completion_date: string;
    completed_at: string;
}
export interface CreateHabitData {
    user_id: number;
    name: string;
    description?: string;
    goal?: string;
    reminder_time?: string;
    reminder_frequency?: string;
    reminder_enabled?: boolean;
    preferred_channel?: string;
}
export interface UpdateHabitData {
    name?: string;
    description?: string;
    goal?: string;
    reminder_time?: string;
    reminder_frequency?: string;
    reminder_enabled?: boolean;
    preferred_channel?: string;
}
export interface HabitWithStreak extends Habit {
    current_streak: number;
    longest_streak: number;
    total_completions: number;
    completion_rate: number;
}
export declare class HabitModel {
    static create(data: CreateHabitData): Promise<Habit>;
    static findById(id: number): Promise<Habit | undefined>;
    static findByUserId(userId: number): Promise<Habit[]>;
    static findAll(): Promise<Habit[]>;
    static update(id: number, data: UpdateHabitData): Promise<Habit>;
    static delete(id: number): Promise<void>;
    static markComplete(habitId: number, date?: string): Promise<HabitCompletion>;
    static unmarkComplete(habitId: number, date?: string): Promise<void>;
    static getCompletions(habitId: number, startDate?: string, endDate?: string): Promise<HabitCompletion[]>;
    static calculateStreak(habitId: number): Promise<{
        current_streak: number;
        longest_streak: number;
    }>;
    static getHabitWithStats(habitId: number): Promise<HabitWithStreak | undefined>;
    static getHabitsWithStats(userId: number): Promise<HabitWithStreak[]>;
    static getHabitsNeedingReminders(): Promise<Habit[]>;
}
