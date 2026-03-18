export interface User {
    id: number;
    username: string;
    email?: string;
    phone_number?: string;
    telegram_chat_id?: string;
    whatsapp_number?: string;
    timezone: string;
    created_at: string;
    updated_at: string;
}
export interface CreateUserData {
    username: string;
    email?: string;
    phone_number?: string;
    telegram_chat_id?: string;
    whatsapp_number?: string;
    timezone?: string;
}
export interface UpdateUserData {
    email?: string;
    phone_number?: string;
    telegram_chat_id?: string;
    whatsapp_number?: string;
    timezone?: string;
}
export declare class UserModel {
    static create(data: CreateUserData): Promise<User>;
    static findById(id: number): Promise<User | undefined>;
    static findByUsername(username: string): Promise<User | undefined>;
    static findByTelegramChatId(chatId: string): Promise<User | undefined>;
    static findAll(): Promise<User[]>;
    static update(id: number, data: UpdateUserData): Promise<User>;
    static delete(id: number): Promise<void>;
    static getMessagingPreferences(userId: number): Promise<{
        phone_number?: string;
        telegram_chat_id?: string;
        whatsapp_number?: string;
    }>;
    static isValidPhoneNumber(phoneNumber: string): boolean;
    static isValidTelegramChatId(chatId: string): boolean;
    static getUserTimezone(userId: number): Promise<string>;
}
