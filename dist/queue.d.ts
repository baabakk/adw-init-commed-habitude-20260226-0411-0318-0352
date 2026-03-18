import { EventEmitter } from 'events';
export interface ReminderScheduledPayload {
    habitId: number;
    userId: number;
    channel: 'sms' | 'telegram' | 'whatsapp';
    schedule: string;
}
declare class ReminderQueue extends EventEmitter {
    publish(event: 'ReminderScheduled', payload: ReminderScheduledPayload): void;
    subscribe(event: 'ReminderScheduled', listener: (payload: ReminderScheduledPayload) => void): void;
}
declare const queue: ReminderQueue;
export default queue;
