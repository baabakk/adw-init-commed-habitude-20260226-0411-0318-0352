export interface SMSSendResult {
    success: boolean;
    error?: string;
}
export declare const sendSMS: (to: string, body: string) => Promise<SMSSendResult>;
