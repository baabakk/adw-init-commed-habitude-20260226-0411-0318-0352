declare module 'node-telegram-bot-api' {
  interface TelegramBotOptions {
    polling?: boolean | {
      interval?: number;
      autoStart?: boolean;
      params?: {
        timeout?: number;
      };
    };
    webHook?: boolean | {
      port?: number;
      host?: string;
      key?: string;
      cert?: string;
    };
  }

  interface Message {
    message_id: number;
    from?: User;
    chat: Chat;
    date: number;
    text?: string;
  }

  interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  }

  interface Chat {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }

  interface SendMessageOptions {
    parse_mode?: 'Markdown' | 'HTML';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: number;
  }

  class TelegramBot {
    constructor(token: string, options?: TelegramBotOptions);
    
    sendMessage(
      chatId: number | string,
      text: string,
      options?: SendMessageOptions
    ): Promise<Message>;
    
    startPolling(): Promise<void>;
    stopPolling(): Promise<void>;
    
    on(event: string, callback: (msg: Message) => void): void;
  }

  export = TelegramBot;
}
