export interface TelegramSendResult {
    success: boolean;
    error?: string;
}
export declare const sendTelegramMessage: (chatId: string, text: string) => Promise<TelegramSendResult>;
