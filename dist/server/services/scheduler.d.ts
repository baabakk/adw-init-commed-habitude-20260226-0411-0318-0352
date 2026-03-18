import * as habitModel from '../models/habit';
export declare function initializeScheduler(): Promise<void>;
export declare function scheduleHabitReminders(habit: habitModel.Habit): Promise<void>;
export declare function cancelHabitReminders(habitId: number): void;
export declare function cancelAllReminders(): void;
declare const _default: {
    initializeScheduler: typeof initializeScheduler;
    scheduleHabitReminders: typeof scheduleHabitReminders;
    cancelHabitReminders: typeof cancelHabitReminders;
    cancelAllReminders: typeof cancelAllReminders;
};
export default _default;
//# sourceMappingURL=scheduler.d.ts.map