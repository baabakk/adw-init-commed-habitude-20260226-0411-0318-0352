import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  databasePath: string;
  timezone: string;
  
  // Twilio SMS Configuration
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    enabled: boolean;
  };
  
  // Telegram Configuration
  telegram: {
    botToken: string;
    enabled: boolean;
  };
  
  // WhatsApp Configuration
  whatsapp: {
    apiUrl: string;
    apiKey: string;
    phoneNumberId: string;
    enabled: boolean;
  };
  
  // Rate Limiting
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
  
  // Retry Configuration
  retry: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
  
  // Cache Configuration
  cache: {
    chartDataTtlSeconds: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databasePath: process.env.DATABASE_PATH || './data/habits.db',
  timezone: process.env.TIMEZONE || 'UTC',
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    enabled: process.env.TWILIO_ENABLED === 'true',
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    enabled: process.env.TELEGRAM_ENABLED === 'true',
  },
  
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
    apiKey: process.env.WHATSAPP_API_KEY || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    enabled: process.env.WHATSAPP_ENABLED === 'true',
  },
  
  rateLimits: {
    sms: {
      maxPerMinute: parseInt(process.env.SMS_RATE_LIMIT_PER_MINUTE || '10', 10),
      maxPerHour: parseInt(process.env.SMS_RATE_LIMIT_PER_HOUR || '100', 10),
    },
    telegram: {
      maxPerMinute: parseInt(process.env.TELEGRAM_RATE_LIMIT_PER_MINUTE || '30', 10),
      maxPerHour: parseInt(process.env.TELEGRAM_RATE_LIMIT_PER_HOUR || '1000', 10),
    },
    whatsapp: {
      maxPerMinute: parseInt(process.env.WHATSAPP_RATE_LIMIT_PER_MINUTE || '20', 10),
      maxPerHour: parseInt(process.env.WHATSAPP_RATE_LIMIT_PER_HOUR || '500', 10),
    },
  },
  
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10),
    initialDelayMs: parseInt(process.env.RETRY_INITIAL_DELAY_MS || '1000', 10),
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY_MS || '10000', 10),
  },
  
  cache: {
    chartDataTtlSeconds: parseInt(process.env.CHART_CACHE_TTL_SECONDS || '300', 10),
  },
};

export default config;
