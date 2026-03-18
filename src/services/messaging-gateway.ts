import { SMSProvider } from './sms-provider';
import { TelegramProvider } from './telegram-provider';
import { WhatsAppProvider } from './whatsapp-provider';
import { UserModel } from '../models/user';

export type MessageChannel = 'sms' | 'telegram' | 'whatsapp';

export interface MessageDeliveryResult {
  success: boolean;
  channel: MessageChannel;
  messageId?: string | number;
  error?: string;
  attemptCount: number;
}

export class MessagingGateway {
  private smsProvider: SMSProvider;
  private telegramProvider: TelegramProvider;
  private whatsappProvider: WhatsAppProvider;

  constructor() {
    this.smsProvider = new SMSProvider();
    this.telegramProvider = new TelegramProvider();
    this.whatsappProvider = new WhatsAppProvider();
  }

  async sendMessage(
    userId: number,
    message: string,
    channel: MessageChannel,
    habitId?: number
  ): Promise<MessageDeliveryResult> {
    // Get user messaging preferences
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        success: false,
        channel,
        error: 'User not found',
        attemptCount: 0,
      };
    }

    try {
      switch (channel) {
        case 'sms':
          return await this.sendViaSMS(user.phone_number, message, userId, habitId);
        
        case 'telegram':
          return await this.sendViaTelegram(user.telegram_chat_id, message, userId, habitId);
        
        case 'whatsapp':
          return await this.sendViaWhatsApp(user.whatsapp_number, message, userId, habitId);
        
        default:
          return {
            success: false,
            channel,
            error: 'Invalid channel',
            attemptCount: 0,
          };
      }
    } catch (error: any) {
      console.error(`Error sending message via ${channel}:`, error);
      return {
        success: false,
        channel,
        error: error.message || 'Unknown error',
        attemptCount: 0,
      };
    }
  }

  async sendMessageWithFallback(
    userId: number,
    message: string,
    preferredChannel: MessageChannel,
    habitId?: number
  ): Promise<MessageDeliveryResult> {
    // Try preferred channel first
    const result = await this.sendMessage(userId, message, preferredChannel, habitId);
    
    if (result.success) {
      return result;
    }

    console.log(`Primary channel ${preferredChannel} failed, attempting fallback`);

    // Try fallback channels
    const fallbackChannels: MessageChannel[] = ['sms', 'telegram', 'whatsapp']
      .filter(ch => ch !== preferredChannel) as MessageChannel[];

    for (const channel of fallbackChannels) {
      const fallbackResult = await this.sendMessage(userId, message, channel, habitId);
      
      if (fallbackResult.success) {
        console.log(`Successfully delivered via fallback channel: ${channel}`);
        return fallbackResult;
      }
    }

    // All channels failed
    return {
      success: false,
      channel: preferredChannel,
      error: 'All delivery channels failed',
      attemptCount: result.attemptCount,
    };
  }

  private async sendViaSMS(
    phoneNumber: string | undefined,
    message: string,
    userId: number,
    habitId?: number
  ): Promise<MessageDeliveryResult> {
    if (!phoneNumber) {
      return {
        success: false,
        channel: 'sms',
        error: 'Phone number not configured',
        attemptCount: 0,
      };
    }

    if (!this.smsProvider.isEnabled()) {
      return {
        success: false,
        channel: 'sms',
        error: 'SMS provider not enabled',
        attemptCount: 0,
      };
    }

    const result = await this.smsProvider.sendSMS(phoneNumber, message, userId, habitId);
    
    return {
      success: result.success,
      channel: 'sms',
      messageId: result.messageId,
      error: result.error,
      attemptCount: result.attemptCount,
    };
  }

  private async sendViaTelegram(
    chatId: string | undefined,
    message: string,
    userId: number,
    habitId?: number
  ): Promise<MessageDeliveryResult> {
    if (!chatId) {
      return {
        success: false,
        channel: 'telegram',
        error: 'Telegram chat ID not configured',
        attemptCount: 0,
      };
    }

    if (!this.telegramProvider.isEnabled()) {
      return {
        success: false,
        channel: 'telegram',
        error: 'Telegram provider not enabled',
        attemptCount: 0,
      };
    }

    const result = await this.telegramProvider.sendMessage(chatId, message, userId, habitId);
    
    return {
      success: result.success,
      channel: 'telegram',
      messageId: result.messageId,
      error: result.error,
      attemptCount: result.attemptCount,
    };
  }

  private async sendViaWhatsApp(
    phoneNumber: string | undefined,
    message: string,
    userId: number,
    habitId?: number
  ): Promise<MessageDeliveryResult> {
    if (!phoneNumber) {
      return {
        success: false,
        channel: 'whatsapp',
        error: 'WhatsApp number not configured',
        attemptCount: 0,
      };
    }

    if (!this.whatsappProvider.isEnabled()) {
      return {
        success: false,
        channel: 'whatsapp',
        error: 'WhatsApp provider not enabled',
        attemptCount: 0,
      };
    }

    const result = await this.whatsappProvider.sendMessage(phoneNumber, message, userId, habitId);
    
    return {
      success: result.success,
      channel: 'whatsapp',
      messageId: result.messageId,
      error: result.error,
      attemptCount: result.attemptCount,
    };
  }

  getAvailableChannels(): MessageChannel[] {
    const channels: MessageChannel[] = [];
    
    if (this.smsProvider.isEnabled()) {
      channels.push('sms');
    }
    if (this.telegramProvider.isEnabled()) {
      channels.push('telegram');
    }
    if (this.whatsappProvider.isEnabled()) {
      channels.push('whatsapp');
    }
    
    return channels;
  }

  async startPolling(): Promise<void> {
    await this.telegramProvider.startPolling();
  }

  async stopPolling(): Promise<void> {
    await this.telegramProvider.stopPolling();
  }
}
