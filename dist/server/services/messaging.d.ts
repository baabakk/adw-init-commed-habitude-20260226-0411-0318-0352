import { MessagingChannel } from '../models/user';
import TelegramBot from 'node-telegram-bot-api';
export interface SendMessageParams {
    channel: MessagingChannel;
    recipient: string;
    message: string;
}
export declare function sendMessage(params: SendMessageParams): Promise<boolean>;
export declare function formatVerificationMessage(code: string): string;
export declare function formatReminderMessage(habitName: string, habitId: number): string;
export declare function formatCompletionConfirmation(habitName: string): string;
export declare function formatStreakNotification(habitName: string, streakCount: number): string;
export declare function parseCompletionReply(message: string): number | null;
export declare function getTelegramBot(): TelegramBot | null;
declare const _default: {
    sendMessage: typeof sendMessage;
    formatVerificationMessage: typeof formatVerificationMessage;
    formatReminderMessage: typeof formatReminderMessage;
    formatCompletionConfirmation: typeof formatCompletionConfirmation;
    formatStreakNotification: typeof formatStreakNotification;
    parseCompletionReply: typeof parseCompletionReply;
    getTelegramBot: typeof getTelegramBot;
};
export default _default;
//# sourceMappingURL=messaging.d.ts.map