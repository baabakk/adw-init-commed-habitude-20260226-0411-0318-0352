export class TelegramAdapter {
  async sendMessage(chatId: string, message: string): Promise<void> {
    if (!chatId) throw new Error('Telegram chatId is required');
    console.log(`[Telegram] Sending to ${chatId}: ${message}`);
  }
}
