"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'commed_habitude',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    },
    whatsapp: {
        enabled: process.env.WHATSAPP_ENABLED === 'true',
    },
    verification: {
        codeLength: 6,
        expirationMinutes: 10,
    },
    habits: {
        maxPerUser: 5,
        maxCustomTimes: 12,
    },
    session: {
        secret: process.env.SESSION_SECRET || 'commed-habitude-secret-key-change-in-production',
        expirationHours: 24 * 30, // 30 days
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map