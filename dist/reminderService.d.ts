import { Reminder } from './models';
export declare class ReminderService {
    private checkInterval;
    private readonly CHECK_FREQUENCY_MS;
    start(): void;
    stop(): void;
    private checkAndSendReminders;
    private shouldSendReminder;
    private sendReminder;
    createReminder(habitId: string, userId: string, time: string, frequency: 'daily' | 'weekdays' | 'weekends' | 'custom', channels: ('sms' | 'telegram' | 'whatsapp')[], daysOfWeek?: number[]): Reminder;
    updateReminder(reminderId: string, updates: Partial<Reminder>): Reminder;
    deleteReminder(reminderId: string): boolean;
    getHabitReminders(habitId: string): Reminder[];
    getUserReminders(userId: string): Reminder[];
    toggleReminder(reminderId: string): Reminder;
    sendTestReminder(reminderId: string): Promise<void>;
    checkStreakNotification(habitId: string): Promise<void>;
    private formatTime;
    private isValidTimeFormat;
    private generateId;
    getStatus(): {
        running: boolean;
        activeReminders: number;
    };
}
export declare const reminderService: ReminderService;
