import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.warn('Telegram credentials not configured. Telegram reminders disabled.');
}

const bot = token ? new TelegramBot(token) : null;

export function sendTelegramReminder(habit: { name: string }): void {
  if (!bot) {
    console.log('Telegram reminder would be sent:', `Time to do: ${habit.name}`);
    return;
  }

  bot.sendMessage(chatId!, `⏰ Time to do: ${habit.name}`)
    .then(() => console.log('Telegram message sent'))
    .catch(error => console.error('Failed to send Telegram message:', error));
}