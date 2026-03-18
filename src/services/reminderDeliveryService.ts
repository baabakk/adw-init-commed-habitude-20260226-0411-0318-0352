import { SmsAdapter } from '../adapters/smsAdapter';
import { TelegramAdapter } from '../adapters/telegramAdapter';
import { WhatsAppAdapter } from '../adapters/whatsappAdapter';
import { withRetry } from '../utils/retryLogic';

const smsAdapter = new SmsAdapter();
const telegramAdapter = new TelegramAdapter();
const whatsappAdapter = new WhatsAppAdapter();

export type ReminderChannel = 'sms' | 'telegram' | 'whatsapp';

export async function deliverReminder(
  channel: ReminderChannel,
  recipient: string,
  message: string
): Promise<void> {
  const send = async (): Promise<void> => {
    switch (channel) {
      case 'sms':
        await smsAdapter.sendMessage(recipient, message);
        break;
      case 'telegram':
        await telegramAdapter.sendMessage(recipient, message);
        break;
      case 'whatsapp':
        await whatsappAdapter.sendMessage(recipient, message);
        break;
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  };

  try {
    await withRetry(send, 3, 1000);
    console.log(`Reminder delivered via ${channel} to ${recipient}`);
  } catch (error) {
    console.error(`Reminder delivery failed via ${channel} to ${recipient}`, error);
    throw error;
  }
}
