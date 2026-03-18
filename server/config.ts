import dotenv from 'dotenv';

dotenv.config();

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

const config: Config = {
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

export default config;
