export interface SMSDeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
    attemptCount: number;
}
export declare class SMSProvider {
    private client;
    private enabled;
    constructor();
    sendSMS(phoneNumber: string, message: string, userId: number, habitId?: number): Promise<SMSDeliveryResult>;
    private checkRateLimit;
    private incrementRateLimit;
    private logDelivery;
    private sleep;
    isEnabled(): boolean;
}
