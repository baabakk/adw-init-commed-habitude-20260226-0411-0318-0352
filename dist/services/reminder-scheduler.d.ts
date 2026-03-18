import { MessagingGateway } from './messaging-gateway';
export declare class ReminderScheduler {
    private messagingGateway;
    private cronJob;
    private isRunning;
    constructor(messagingGateway: MessagingGateway);
    start(): void;
    stop(): void;
    private checkAndSendReminders;
    private sendReminder;
    private shouldSendReminderToday;
    private createReminderMessage;
    private isStreakMilestone;
    private sendStreakNotification;
    private createStreakMessage;
    private formatTime;
    isSchedulerRunning(): boolean;
}
