export interface Config {
    port: number;
    databasePath: string;
    timezone: string;
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
        enabled: boolean;
    };
    telegram: {
        botToken: string;
        enabled: boolean;
    };
    whatsapp: {
        apiUrl: string;
        apiKey: string;
        phoneNumberId: string;
        enabled: boolean;
    };
    rateLimits: {
        sms: {
            maxPerMinute: number;
            maxPerHour: number;
        };
        telegram: {
            maxPerMinute: number;
            maxPerHour: number;
        };
        whatsapp: {
            maxPerMinute: number;
            maxPerHour: number;
        };
    };
    retry: {
        maxAttempts: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };
    cache: {
        chartDataTtlSeconds: number;
    };
}
declare const config: Config;
export default config;
