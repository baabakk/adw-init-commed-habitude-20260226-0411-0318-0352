import { EventEmitter } from 'events';

/**
 * Simple in‑memory event queue for ReminderScheduled events.
 * In production this would be replaced by a durable queue like RabbitMQ.
 */
export interface ReminderScheduledPayload {
  habitId: number;
  userId: number;
  channel: 'sms' | 'telegram' | 'whatsapp';
  schedule: string; // ISO 8601 datetime string when the reminder should be sent
}

class ReminderQueue extends EventEmitter {
  publish(event: 'ReminderScheduled', payload: ReminderScheduledPayload) {
    this.emit(event, payload);
  }

  subscribe(event: 'ReminderScheduled', listener: (payload: ReminderScheduledPayload) => void) {
    this.on(event, listener);
  }
}

const queue = new ReminderQueue();
export default queue;
