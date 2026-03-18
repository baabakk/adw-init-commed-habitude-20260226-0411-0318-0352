export class WhatsAppAdapter {
  async sendMessage(to: string, message: string): Promise<void> {
    if (!to) throw new Error('WhatsApp recipient is required');
    console.log(`[WhatsApp] Sending to ${to}: ${message}`);
  }
}
