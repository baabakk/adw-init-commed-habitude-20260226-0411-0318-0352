declare module 'node-telegram-bot-api' {
  interface Message {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    from?: {
      id: number;
      username?: string;
    };
  }

  interface SendMessageOptions {
    parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: number;
  }

  class TelegramBot {
    constructor(token: string, options?: any);
    sendMessage(chatId: string | number, text: string, options?: SendMessageOptions): Promise<Message>;
    onText(regexp: RegExp, callback: (msg: Message, match: RegExpExecArray | null) => void): void;
    on(event: string, callback: (error?: any) => void): void;
    setWebHook(url: string): Promise<boolean>;
    deleteWebHook(): Promise<boolean>;
  }
  
  export = TelegramBot;
}
