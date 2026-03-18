import TelegramBot from 'node-telegram-bot-api';
import config from '../config';
import { execute, query } from '../database';

export interface TelegramDeliveryResult {
  success: boolean;
  messageId?: number;
  error?: string;
  attemptCount: number;
}

export class TelegramProvider {
  private bot: TelegramBot | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.telegram.enabled;

    if (this.enabled && config.telegram.botToken) {
      try {
        this.bot = new TelegramBot(config.telegram.botToken, { polling: false });
        console.log('Telegram provider initialized');
      } catch (error) {
        console.error('Failed to initialize Telegram bot:', error);
        this.enabled = false;
      }
    } else {
      console.log('Telegram provider disabled or not configured');
    }
  }

  async sendMessage(
    chatId: string,
    message: string,
    userId: number,
    habitId?: number
  ): Promise<TelegramDeliveryResult> {
    if (!this.enabled || !this.bot) {
      return {
        success: false,
        error: 'Telegram provider not enabled or configured',
        attemptCount: 0,
      };
    }

    // Check rate limits
    const canSend = await this.checkRateLimit();
    if (!canSend) {
      await this.logDelivery(userId, habitId, chatId, message, 'rate_limited', 0, 'Rate limit exceeded');
      return {
        success: false,
        error: 'Rate limit exceeded',
        attemptCount: 0,
      };
    }

    // Attempt delivery with retry logic
    let attemptCount = 0;
    let lastError: string | undefined;

    for (let i = 0; i < config.retry.maxAttempts; i++) {
      attemptCount++;

      try {
        const result = await this.bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
        });

        // Log successful delivery
        await this.logDelivery(userId, habitId, chatId, message, 'sent', attemptCount);
        await this.incrementRateLimit();

        return {
          success: true,
          messageId: result.message_id,
          attemptCount,
        };
      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        console.error(`Telegram delivery attempt ${attemptCount} failed:`, error);

        // Don't retry on certain errors
        if (error.response?.statusCode === 400 || error.response?.statusCode === 403) {
          // Invalid chat ID or bot blocked by user
          await this.logDelivery(userId, habitId, chatId, message, 'failed', attemptCount, lastError);
          return {
            success: false,
            error: lastError,
            attemptCount,
          };
        }

        // Wait before retry with exponential backoff
        if (i < config.retry.maxAttempts - 1) {
          const delay = Math.min(
            config.retry.initialDelayMs * Math.pow(2, i),
            config.retry.maxDelayMs
          );
          await this.sleep(delay);
        }
      }
    }

    // All attempts failed
    await this.logDelivery(userId, habitId, chatId, message, 'failed', attemptCount, lastError);

    return {
      success: false,
      error: lastError || 'All delivery attempts failed',
      attemptCount,
    };
  }

  private async checkRateLimit(): Promise<boolean> {
    const now = new Date();
    const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).toISOString();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();

    // Check minute limit
    const minuteCount = await query<{ message_count: number }>(
      `SELECT message_count FROM rate_limit_tracking 
       WHERE channel = 'telegram' AND window_type = 'minute' AND window_start = ?`,
      [minuteStart]
    );

    if (minuteCount.length > 0 && minuteCount[0].message_count >= config.rateLimits.telegram.maxPerMinute) {
      return false;
    }

    // Check hour limit
    const hourCount = await query<{ message_count: number }>(
      `SELECT message_count FROM rate_limit_tracking 
       WHERE channel = 'telegram' AND window_type = 'hour' AND window_start = ?`,
      [hourStart]
    );

    if (hourCount.length > 0 && hourCount[0].message_count >= config.rateLimits.telegram.maxPerHour) {
      return false;
    }

    return true;
  }

  private async incrementRateLimit(): Promise<void> {
    const now = new Date();
    const minuteStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).toISOString();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();

    // Increment minute counter
    await execute(
      `INSERT INTO rate_limit_tracking (channel, window_start, window_type, message_count)
       VALUES ('telegram', ?, 'minute', 1)
       ON CONFLICT(channel, window_start, window_type) 
       DO UPDATE SET message_count = message_count + 1`,
      [minuteStart]
    );

    // Increment hour counter
    await execute(
      `INSERT INTO rate_limit_tracking (channel, window_start, window_type, message_count)
       VALUES ('telegram', ?, 'hour', 1)
       ON CONFLICT(channel, window_start, window_type) 
       DO UPDATE SET message_count = message_count + 1`,
      [hourStart]
    );
  }

  private async logDelivery(
    userId: number,
    habitId: number | undefined,
    recipient: string,
    message: string,
    status: string,
    attemptCount: number,
    errorMessage?: string
  ): Promise<void> {
    await execute(
      `INSERT INTO message_delivery_log (user_id, habit_id, channel, recipient, message, status, attempt_count, error_message)
       VALUES (?, ?, 'telegram', ?, ?, ?, ?, ?)`,
      [userId, habitId || null, recipient, message, status, attemptCount, errorMessage || null]
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async startPolling(): Promise<void> {
    if (this.enabled && this.bot) {
      try {
        await this.bot.startPolling();
        console.log('Telegram bot polling started');
      } catch (error) {
        console.error('Failed to start Telegram polling:', error);
      }
    }
  }

  async stopPolling(): Promise<void> {
    if (this.bot) {
      try {
        await this.bot.stopPolling();
        console.log('Telegram bot polling stopped');
      } catch (error) {
        console.error('Failed to stop Telegram polling:', error);
      }
    }
  }
}
