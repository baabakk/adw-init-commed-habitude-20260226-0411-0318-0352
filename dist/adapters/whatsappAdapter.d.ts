export interface WhatsAppSendResult {
    success: boolean;
    error?: string;
}
export declare const sendWhatsAppMessage: (to: string, body: string) => Promise<WhatsAppSendResult>;
