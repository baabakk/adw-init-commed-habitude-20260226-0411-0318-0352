import client from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.USER_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber || !toNumber) {
  console.warn('Twilio credentials not configured. SMS reminders disabled.');
}

const twilioClient = accountSid && authToken ? client(accountSid, authToken) : null;

export function sendSMSReminder(habit: { name: string }): void {
  if (!twilioClient) {
    console.log('SMS reminder would be sent:', `Time to do: ${habit.name}`);
    return;
  }

  twilioClient.messages
    .create({
      body: `⏰ Time to do: ${habit.name}`,
      from: fromNumber,
      to: toNumber
    })
    .then(message => console.log('SMS sent:', message.sid))
    .catch(error => console.error('Failed to send SMS:', error));
}