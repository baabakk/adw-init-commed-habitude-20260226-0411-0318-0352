export declare class SMSProvider {
    private accountSid;
    private authToken;
    private fromNumber;
    private enabled;
    constructor();
    sendSMS(to: string, message: string): Promise<void>;
    sendBulkSMS(recipients: {
        to: string;
        message: string;
    }[]): Promise<{
        successful: number;
        failed: number;
        errors: string[];
    }>;
    testConnection(): Promise<boolean>;
    validatePhoneNumber(phoneNumber: string): boolean;
    getStatus(): {
        enabled: boolean;
        configured: boolean;
        provider: string;
    };
}
export declare const smsProvider: SMSProvider;
