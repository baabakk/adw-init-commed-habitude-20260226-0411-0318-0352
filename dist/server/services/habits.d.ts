import * as habitModel from '../models/habit';
export interface CreateHabitParams {
    userId: number;
    name: string;
    goal?: string;
    frequency: habitModel.HabitFrequency;
    customTimes?: string[];
}
export declare function createHabit(params: CreateHabitParams): Promise<{
    success: boolean;
    habit?: habitModel.Habit;
    error?: string;
}>;
export declare function completeHabitForToday(habitId: number, userId: number, method: 'web' | 'sms' | 'telegram' | 'whatsapp'): Promise<{
    success: boolean;
    streak?: number;
    error?: string;
}>;
export declare function getHabitStats(habitId: number, userId: number): Promise<any>;
export declare function stopHabit(habitId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function deleteHabit(habitId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
}>;
declare const _default: {
    createHabit: typeof createHabit;
    completeHabitForToday: typeof completeHabitForToday;
    getHabitStats: typeof getHabitStats;
    stopHabit: typeof stopHabit;
    deleteHabit: typeof deleteHabit;
};
export default _default;
//# sourceMappingURL=habits.d.ts.map