export declare class TelegramProvider {
    private botToken;
    private enabled;
    private webhookUrl;
    constructor();
    sendMessage(chatId: string, message: string): Promise<void>;
    sendMessageWithButtons(chatId: string, message: string, buttons: {
        text: string;
        callbackData: string;
    }[][]): Promise<void>;
    setWebhook(url: string): Promise<boolean>;
    handleWebhook(update: any): Promise<void>;
    testConnection(): Promise<boolean>;
    getBotInfo(): Promise<any>;
    getStatus(): {
        enabled: boolean;
        configured: boolean;
        webhookUrl?: string;
    };
}
export declare const telegramProvider: TelegramProvider;
