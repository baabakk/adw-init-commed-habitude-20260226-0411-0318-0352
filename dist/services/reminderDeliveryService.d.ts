export interface Reminder {
    id: string;
    userId: string;
    habitId: string;
    habitName: string;
    time: string;
    days: string[];
    channels: ('sms' | 'telegram' | 'whatsapp')[];
    recipient: {
        phone?: string;
        telegramId?: string;
        whatsappNumber?: string;
    };
}
export interface DeliveryResult {
    success: boolean;
    channel: string;
    message: string;
}
export declare const deliverReminder: (reminder: Reminder) => Promise<DeliveryResult[]>;
