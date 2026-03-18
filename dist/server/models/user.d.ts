export type MessagingChannel = 'sms' | 'telegram' | 'whatsapp';
export interface User {
    id: number;
    messaging_channel: MessagingChannel;
    channel_identifier: string;
    timezone: string;
    verification_code?: string;
    verification_code_expires_at?: Date;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserData {
    messaging_channel: MessagingChannel;
    channel_identifier: string;
    timezone: string;
    verification_code: string;
    verification_code_expires_at: Date;
}
export declare function createUser(data: CreateUserData): Promise<User>;
export declare function findUserByChannelIdentifier(channel_identifier: string): Promise<User | null>;
export declare function findUserById(id: number): Promise<User | null>;
export declare function updateVerificationCode(userId: number, code: string, expiresAt: Date): Promise<void>;
export declare function verifyUser(userId: number): Promise<void>;
export declare function checkVerificationCode(userId: number, code: string): Promise<boolean>;
declare const _default: {
    createUser: typeof createUser;
    findUserByChannelIdentifier: typeof findUserByChannelIdentifier;
    findUserById: typeof findUserById;
    updateVerificationCode: typeof updateVerificationCode;
    verifyUser: typeof verifyUser;
    checkVerificationCode: typeof checkVerificationCode;
};
export default _default;
//# sourceMappingURL=user.d.ts.map