export class SmsAdapter {
  async sendMessage(to: string, message: string): Promise<void> {
    if (!to) throw new Error('SMS recipient is required');
    console.log(`[SMS] Sending to ${to}: ${message}`);
  }
}
