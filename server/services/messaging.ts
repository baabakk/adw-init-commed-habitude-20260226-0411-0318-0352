import config from '../config';
import { MessagingChannel } from '../models/user';
import twilio from 'twilio';
import TelegramBot from 'node-telegram-bot-api';

// Initialize messaging clients
let twilioClient: any = null;
let telegramBot: TelegramBot | null = null;

if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
}

if (config.telegram.botToken) {
  telegramBot = new TelegramBot(config.telegram.botToken, { polling: false });
}

export interface SendMessageParams {
  channel: MessagingChannel;
  recipient: string;
  message: string;
}

export async function sendMessage(params: SendMessageParams): Promise<boolean> {
  const { channel, recipient, message } = params;

  try {
    switch (channel) {
      case 'sms':
        return await sendSMS(recipient, message);
      case 'telegram':
        return await sendTelegram(recipient, message);
      case 'whatsapp':
        return await sendWhatsApp(recipient, message);
      default:
        console.error('Unknown messaging channel:', channel);
        return false;
    }
  } catch (error) {
    console.error(`Failed to send message via ${channel}:`, error);
    return false;
  }
}

async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

async function sendTelegram(chatId: string, message: string): Promise<boolean> {
  if (!telegramBot) {
    console.error('Telegram bot not initialized');
    return false;
  }

  try {
    await telegramBot.sendMessage(chatId, message);
    console.log(`Telegram message sent to ${chatId}`);
    return true;
  } catch (error) {
    console.error('Telegram sending failed:', error);
    return false;
  }
}

async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  if (!config.whatsapp.enabled) {
    console.error('WhatsApp not enabled');
    return false;
  }

  // WhatsApp Business API integration would go here
  // For POC, we'll use Twilio's WhatsApp integration
  if (!twilioClient) {
    console.error('Twilio client not initialized for WhatsApp');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${config.twilio.phoneNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });
    console.log(`WhatsApp message sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    return false;
  }
}

export function formatVerificationMessage(code: string): string {
  return `Your Commed Habitude verification code is: ${code}\n\nThis code will expire in ${config.verification.expirationMinutes} minutes.`;
}

export function formatReminderMessage(habitName: string, habitId: number): string {
  return `⏰ Reminder: ${habitName}\n\nReply with "Habit (${habitId}): done" to mark as complete.`;
}

export function formatCompletionConfirmation(habitName: string): string {
  return `${habitName} Completed! 🎉`;
}

export function formatStreakNotification(habitName: string, streakCount: number): string {
  return `🔥 Amazing! You've completed "${habitName}" for ${streakCount} days in a row! Keep it up!`;
}

export function parseCompletionReply(message: string): number | null {
  // Expected format: "Habit (xxxx): done"
  const regex = /Habit\s*\((\d+)\)\s*:\s*done/i;
  const match = message.match(regex);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

export function getTelegramBot(): TelegramBot | null {
  return telegramBot;
}

export default {
  sendMessage,
  formatVerificationMessage,
  formatReminderMessage,
  formatCompletionConfirmation,
  formatStreakNotification,
  parseCompletionReply,
  getTelegramBot,
};
