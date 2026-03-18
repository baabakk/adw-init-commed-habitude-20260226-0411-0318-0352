export type HabitFrequency = 'daily' | 'every_2_days' | 'weekly' | 'monthly' | 'hourly_1' | 'hourly_6' | 'custom';
export interface Habit {
    id: number;
    user_id: number;
    name: string;
    goal?: string;
    frequency: HabitFrequency;
    custom_times?: string;
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
export declare function createHabit(data: CreateHabitData): Promise<Habit>;
export declare function findHabitsByUserId(userId: number): Promise<Habit[]>;
export declare function findHabitById(habitId: number): Promise<Habit | null>;
export declare function countActiveHabits(userId: number): Promise<number>;
export declare function stopHabit(habitId: number): Promise<void>;
export declare function deleteHabit(habitId: number): Promise<void>;
export declare function completeHabit(habitId: number, userId: number, completionDate: Date, method: 'web' | 'sms' | 'telegram' | 'whatsapp'): Promise<Completion | null>;
export declare function updateStreak(habitId: number, currentStreak: number, longestStreak: number): Promise<void>;
export declare function getCompletions(habitId: number, limit?: number): Promise<Completion[]>;
export declare function getCompletionsByDateRange(habitId: number, startDate: Date, endDate: Date): Promise<Completion[]>;
export declare function hasCompletionForDate(habitId: number, date: Date): Promise<boolean>;
export declare function getAllActiveHabits(): Promise<Habit[]>;
declare const _default: {
    createHabit: typeof createHabit;
    findHabitsByUserId: typeof findHabitsByUserId;
    findHabitById: typeof findHabitById;
    countActiveHabits: typeof countActiveHabits;
    stopHabit: typeof stopHabit;
    deleteHabit: typeof deleteHabit;
    completeHabit: typeof completeHabit;
    updateStreak: typeof updateStreak;
    getCompletions: typeof getCompletions;
    getCompletionsByDateRange: typeof getCompletionsByDateRange;
    hasCompletionForDate: typeof hasCompletionForDate;
    getAllActiveHabits: typeof getAllActiveHabits;
};
export default _default;
//# sourceMappingURL=habit.d.ts.map