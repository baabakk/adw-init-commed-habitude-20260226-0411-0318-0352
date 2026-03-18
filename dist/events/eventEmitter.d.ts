export interface HabitCompletedEvent {
    habitId: string;
    userId: string;
    completedAt: Date;
    timezone: string;
}
declare class EventEmitter {
    private listeners;
    on(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}
declare const eventEmitter: EventEmitter;
export default eventEmitter;
