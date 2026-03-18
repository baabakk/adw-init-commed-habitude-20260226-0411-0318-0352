export interface TelegramDeliveryResult {
    success: boolean;
    messageId?: number;
    error?: string;
    attemptCount: number;
}
export declare class TelegramProvider {
    private bot;
    private enabled;
    constructor();
    sendMessage(chatId: string, message: string, userId: number, habitId?: number): Promise<TelegramDeliveryResult>;
    private checkRateLimit;
    private incrementRateLimit;
    private logDelivery;
    private sleep;
    isEnabled(): boolean;
    startPolling(): Promise<void>;
    stopPolling(): Promise<void>;
}
