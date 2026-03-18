export declare const timezoneToUTC: (localTime: Date | string, timezone: string) => Date;
export declare const utcToTimezone: (utcTime: Date | string, timezone: string) => Date;
export declare const startOfDayInTimezone: (date: Date | string, timezone: string) => Date;
export declare const endOfDayInTimezone: (date: Date | string, timezone: string) => Date;
export declare const isSameDayInTimezone: (date1: Date, date2: Date, timezone: string) => boolean;
