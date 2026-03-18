export type MessageChannel = 'sms' | 'telegram' | 'whatsapp';
export interface MessageDeliveryResult {
    success: boolean;
    channel: MessageChannel;
    messageId?: string | number;
    error?: string;
    attemptCount: number;
}
export declare class MessagingGateway {
    private smsProvider;
    private telegramProvider;
    private whatsappProvider;
    constructor();
    sendMessage(userId: number, message: string, channel: MessageChannel, habitId?: number): Promise<MessageDeliveryResult>;
    sendMessageWithFallback(userId: number, message: string, preferredChannel: MessageChannel, habitId?: number): Promise<MessageDeliveryResult>;
    private sendViaSMS;
    private sendViaTelegram;
    private sendViaWhatsApp;
    getAvailableChannels(): MessageChannel[];
    startPolling(): Promise<void>;
    stopPolling(): Promise<void>;
}
