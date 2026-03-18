import sqlite3 from 'sqlite3';
import { User, Habit, Completion, Streak } from './models';
export interface DatabaseRow {
    [key: string]: any;
}
export declare function initializeDatabase(): Promise<void>;
export declare function query<T = DatabaseRow>(sql: string, params?: any[]): Promise<T[]>;
export declare function queryOne<T = DatabaseRow>(sql: string, params?: any[]): Promise<T | undefined>;
export declare function execute(sql: string, params?: any[]): Promise<{
    lastID: number;
    changes: number;
}>;
export declare function closeDatabase(): Promise<void>;
export declare function getDatabase(): sqlite3.Database;
export declare function getUser(userId: string): Promise<User | undefined>;
export declare function getHabitsByUser(userId: string): Promise<Habit[]>;
export declare function createHabit(habit: Habit): Promise<Habit>;
export declare function getHabit(habitId: string): Promise<Habit | undefined>;
export declare function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | undefined>;
export declare function getCompletionsByDate(habitId: string, date: string): Promise<Completion[]>;
export declare function createCompletion(completion: Completion): Promise<Completion>;
export declare function getCompletionsByHabit(habitId: string): Promise<Completion[]>;
export declare function updateStreak(habitId: string, streak: Streak): Promise<Streak>;
export declare function getStreak(habitId: string): Promise<Streak | undefined>;
export declare const db: {
    getUser: typeof getUser;
    getHabitsByUser: typeof getHabitsByUser;
    createHabit: typeof createHabit;
    getHabit: typeof getHabit;
    updateHabit: typeof updateHabit;
    getCompletionsByDate: typeof getCompletionsByDate;
    createCompletion: typeof createCompletion;
    getCompletionsByHabit: typeof getCompletionsByHabit;
    updateStreak: typeof updateStreak;
    getStreak: typeof getStreak;
};
