export interface WhatsAppDeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
    attemptCount: number;
}
export declare class WhatsAppProvider {
    private client;
    private enabled;
    constructor();
    sendMessage(phoneNumber: string, message: string, userId: number, habitId?: number): Promise<WhatsAppDeliveryResult>;
    private checkRateLimit;
    private incrementRateLimit;
    private logDelivery;
    private sleep;
    isEnabled(): boolean;
}
