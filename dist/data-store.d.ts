export interface Habit {
    id: number;
    name: string;
    reminderTime: string;
    reminderChannels: ('sms' | 'telegram' | 'whatsapp')[];
    createdAt: Date;
}
export interface Completion {
    habitId: number;
    date: string;
    completedAt: Date;
}
declare let habits: Habit[];
declare let completions: Completion[];
export { habits, completions };
export declare function addHabit(name: string, reminderTime: string, reminderChannels: ('sms' | 'telegram' | 'whatsapp')[]): Habit;
export declare function markHabitComplete(habitId: number): void;
export declare function getHabitProgress(habitId: number): Completion[];
export declare function getHabitById(habitId: number): Habit | undefined;
