import { NotificationPayload } from './models';
export declare class MessagingService {
    sendNotification(payload: NotificationPayload): Promise<{
        success: boolean;
        results: {
            channel: string;
            success: boolean;
            error?: string;
        }[];
    }>;
    sendHabitReminder(userId: string, habitId: string, habitName: string, channels: ('sms' | 'telegram' | 'whatsapp')[]): Promise<void>;
    sendStreakNotification(userId: string, habitId: string, habitName: string, streakCount: number, channels: ('sms' | 'telegram' | 'whatsapp')[]): Promise<void>;
    testConnectivity(): Promise<{
        sms: boolean;
        telegram: boolean;
        whatsapp: boolean;
    }>;
    validateUserChannels(userId: string): Promise<{
        valid: boolean;
        availableChannels: ('sms' | 'telegram' | 'whatsapp')[];
    }>;
}
export declare const messagingService: MessagingService;
