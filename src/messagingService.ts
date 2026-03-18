/**
 * Abstraction layer for multi-channel messaging (SMS, Telegram, WhatsApp)
 */

import { NotificationPayload } from './models';
import { smsProvider } from './smsProvider';
import { telegramProvider } from './telegramProvider';
import { whatsappProvider } from './whatsappProvider';
import { getUser } from './database';

export class MessagingService {
  /**
   * Send notification through specified channels
   */
  async sendNotification(payload: NotificationPayload): Promise<{
    success: boolean;
    results: { channel: string; success: boolean; error?: string }[];
  }> {
    const user = await getUser(payload.userId);
    if (!user) {
      return {
        success: false,
        results: [{ channel: 'all', success: false, error: 'User not found' }]
      };
    }

    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Send through each requested channel
    for (const channel of payload.channels) {
      try {
        switch (channel) {
          case 'sms':
            if (user.phoneNumber) {
              await smsProvider.sendSMS(user.phoneNumber, payload.message);
              results.push({ channel: 'sms', success: true });
            } else {
              results.push({ channel: 'sms', success: false, error: 'No phone number configured' });
            }
            break;

          case 'telegram':
            if (user.telegramId) {
              await telegramProvider.sendMessage(user.telegramId, payload.message);
              results.push({ channel: 'telegram', success: true });
            } else {
              results.push({ channel: 'telegram', success: false, error: 'No Telegram ID configured' });
            }
            break;

          case 'whatsapp':
            if (user.whatsappNumber) {
              await whatsappProvider.sendMessage(user.whatsappNumber, payload.message);
              results.push({ channel: 'whatsapp', success: true });
            } else {
              results.push({ channel: 'whatsapp', success: false, error: 'No WhatsApp number configured' });
            }
            break;

          default:
            results.push({ channel, success: false, error: 'Unknown channel' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ channel, success: false, error: errorMessage });
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }

    const allSuccessful = results.every(r => r.success);

    return {
      success: allSuccessful,
      results
    };
  }

  /**
   * Send habit reminder
   */
  async sendHabitReminder(
    userId: string,
    habitId: string,
    habitName: string,
    channels: ('sms' | 'telegram' | 'whatsapp')[]
  ): Promise<void> {
    const message = `⏰ Reminder: Time to complete your habit "${habitName}"! Keep up the great work! 💪`;

    const payload: NotificationPayload = {
      userId,
      habitId,
      habitName,
      message,
      channels
    };

    const result = await this.sendNotification(payload);
    
    if (!result.success) {
      console.warn(`Some reminders failed to send for habit ${habitId}:`, result.results);
    }
  }

  /**
   * Send streak milestone notification
   */
  async sendStreakNotification(
    userId: string,
    habitId: string,
    habitName: string,
    streakCount: number,
    channels: ('sms' | 'telegram' | 'whatsapp')[]
  ): Promise<void> {
    const message = `🎉 Congratulations! You've maintained a ${streakCount}-day streak for "${habitName}"! Keep it going! 🔥`;

    const payload: NotificationPayload = {
      userId,
      habitId,
      habitName,
      message,
      channels
    };

    await this.sendNotification(payload);
  }

  /**
   * Test connectivity for all messaging providers
   */
  async testConnectivity(): Promise<{
    sms: boolean;
    telegram: boolean;
    whatsapp: boolean;
  }> {
    return {
      sms: await smsProvider.testConnection(),
      telegram: await telegramProvider.testConnection(),
      whatsapp: await whatsappProvider.testConnection()
    };
  }

  /**
   * Validate user has at least one messaging channel configured
   */
  async validateUserChannels(userId: string): Promise<{
    valid: boolean;
    availableChannels: ('sms' | 'telegram' | 'whatsapp')[];
  }> {
    const user = await getUser(userId);
    if (!user) {
      return { valid: false, availableChannels: [] };
    }

    const availableChannels: ('sms' | 'telegram' | 'whatsapp')[] = [];

    if (user.phoneNumber) {
      availableChannels.push('sms');
    }
    if (user.telegramId) {
      availableChannels.push('telegram');
    }
    if (user.whatsappNumber) {
      availableChannels.push('whatsapp');
    }

    return {
      valid: availableChannels.length > 0,
      availableChannels
    };
  }
}

export const messagingService = new MessagingService();
