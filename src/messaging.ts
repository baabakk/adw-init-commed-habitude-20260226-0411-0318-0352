import queue, { ReminderScheduledPayload } from './queue';
import fetch from 'node-fetch';

/**
 * Adapter functions to send reminders via external messaging platforms.
 * In a real implementation these would call the actual provider APIs with proper authentication.
 */

const sendSMS = async (payload: ReminderScheduledPayload) => {
  const response = await fetch('https://api.example.com/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: payload.userId, // placeholder – map userId to phone number in real app
      message: `Reminder: habit ${payload.habitId} is due now.`,
      schedule: payload.schedule,
    }),
  });
  if (!response.ok) {
    throw new Error(`SMS send failed: ${response.statusText}`);
  }
  return response.json();
};

const sendTelegram = async (payload: ReminderScheduledPayload) => {
  const response = await fetch('https://api.example.com/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: payload.userId, // placeholder – map to Telegram chat ID
      text: `Reminder: habit ${payload.habitId} is due now.`,
      schedule: payload.schedule,
    }),
  });
  if (!response.ok) {
    throw new Error(`Telegram send failed: ${response.statusText}`);
  }
  return response.json();
};

const sendWhatsApp = async (payload: ReminderScheduledPayload) => {
  const response = await fetch('https://api.example.com/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: payload.userId, // placeholder – map to WhatsApp number
      body: `Reminder: habit ${payload.habitId} is due now.`,
      schedule: payload.schedule,
    }),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.statusText}`);
  }
  return response.json();
};

// Central dispatcher based on channel
const dispatch = async (payload: ReminderScheduledPayload) => {
  try {
    switch (payload.channel) {
      case 'sms':
        await sendSMS(payload);
        break;
      case 'telegram':
        await sendTelegram(payload);
        break;
      case 'whatsapp':
        await sendWhatsApp(payload);
        break;
      default:
        console.warn('Unknown channel', payload.channel);
    }
    console.log(`Reminder sent for habit ${payload.habitId} via ${payload.channel}`);
  } catch (err) {
    console.error('Failed to send reminder', err);
    // In production, implement retry/backoff logic here
  }
};

// Subscribe to the in‑memory queue
queue.subscribe('ReminderScheduled', dispatch);

export { sendSMS, sendTelegram, sendWhatsApp };
