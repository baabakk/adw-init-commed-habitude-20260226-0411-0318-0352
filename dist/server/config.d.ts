interface Config {
    port: number;
    nodeEnv: string;
    database: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    telegram: {
        botToken: string;
    };
    whatsapp: {
        enabled: boolean;
    };
    verification: {
        codeLength: number;
        expirationMinutes: number;
    };
    habits: {
        maxPerUser: number;
        maxCustomTimes: number;
    };
    session: {
        secret: string;
        expirationHours: number;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=config.d.ts.map