import client from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const toNumber = process.env.USER_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !fromNumber || !toNumber) {
  console.warn('Twilio WhatsApp credentials not configured. WhatsApp reminders disabled.');
}

const twilioClient = accountSid && authToken ? client(accountSid, authToken) : null;

export function sendWhatsAppReminder(habit: { name: string }): void {
  if (!twilioClient) {
    console.log('WhatsApp reminder would be sent:', `Time to do: ${habit.name}`);
    return;
  }

  twilioClient.messages
    .create({
      body: `⏰ Time to do: ${habit.name}`,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`
    })
    .then(message => console.log('WhatsApp message sent:', message.sid))
    .catch(error => console.error('Failed to send WhatsApp message:', error));
}