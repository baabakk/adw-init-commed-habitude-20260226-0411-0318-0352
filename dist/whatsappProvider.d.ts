export declare class WhatsAppProvider {
    private apiKey;
    private phoneNumberId;
    private apiVersion;
    private enabled;
    constructor();
    sendMessage(to: string, message: string): Promise<void>;
    sendTemplateMessage(to: string, templateName: string, languageCode?: string, parameters?: string[]): Promise<void>;
    sendMessageWithButtons(to: string, message: string, buttons: {
        id: string;
        title: string;
    }[]): Promise<void>;
    handleWebhook(update: any): Promise<void>;
    verifyWebhookSignature(signature: string, payload: string): boolean;
    testConnection(): Promise<boolean>;
    getStatus(): {
        enabled: boolean;
        configured: boolean;
        apiVersion: string;
    };
}
export declare const whatsappProvider: WhatsAppProvider;
