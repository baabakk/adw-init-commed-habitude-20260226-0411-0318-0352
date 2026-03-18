import { Habit, Completion, Streak, ProgressData } from './models';
export declare class HabitService {
    createHabit(userId: string, name: string, description?: string, goal?: string): Habit;
    getUserHabits(userId: string): Habit[];
    getHabit(habitId: string): Habit | undefined;
    updateHabit(habitId: string, updates: Partial<Habit>): Habit;
    deleteHabit(habitId: string): boolean;
    markComplete(habitId: string, userId: string, date?: Date): Completion;
    getCompletionHistory(habitId: string, days?: number): Completion[];
    private updateStreak;
    getStreak(habitId: string): Streak;
    getProgressData(habitId: string, days?: number): ProgressData;
    shouldSendStreakNotification(habitId: string): boolean;
    private formatDate;
    private generateId;
}
export declare const habitService: HabitService;
