import { MessagingChannel } from '../models/user';
export interface SessionData {
    userId: number;
    channelIdentifier: string;
    expiresAt: Date;
}
export declare function generateVerificationCode(): string;
export declare function generateSessionToken(): string;
export declare function initiateSignup(messagingChannel: MessagingChannel, channelIdentifier: string, timezone: string): Promise<{
    user: any;
    code: string;
}>;
export declare function verifyCode(channelIdentifier: string, code: string): Promise<{
    success: boolean;
    token?: string;
    userId?: number;
    error?: string;
}>;
export declare function validateSession(token: string): SessionData | null;
export declare function destroySession(token: string): void;
export declare function cleanupExpiredSessions(): void;
declare const _default: {
    generateVerificationCode: typeof generateVerificationCode;
    generateSessionToken: typeof generateSessionToken;
    initiateSignup: typeof initiateSignup;
    verifyCode: typeof verifyCode;
    validateSession: typeof validateSession;
    destroySession: typeof destroySession;
    cleanupExpiredSessions: typeof cleanupExpiredSessions;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map