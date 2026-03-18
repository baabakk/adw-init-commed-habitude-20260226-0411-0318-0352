import { AppDataSource } from '../db/connection';
import { Habit, HabitCompletion } from '../db/models';
import { EVENTS, HabitCompletedEvent, eventBus } from '../events/eventEmitter';
import { isConsecutiveDay } from '../utils/timezoneUtils';

export function registerStreakHandlers(): void {
  eventBus.on(EVENTS.HABIT_COMPLETED, async (event: HabitCompletedEvent) => {
    const habitRepo = AppDataSource.getRepository(Habit);
    const completionRepo = AppDataSource.getRepository(HabitCompletion);

    const habit = await habitRepo.findOne({
      where: { id: event.habitId },
      relations: ['user']
    });

    if (!habit) return;

    const completions = await completionRepo.find({
      where: { habit: { id: habit.id } },
      order: { completedAt: 'DESC' },
      take: 2
    });

    if (completions.length < 2) {
      habit.currentStreak = 1;
    } else {
      const [latest, previous] = completions;
      habit.currentStreak = isConsecutiveDay(previous.completedAt, latest.completedAt, habit.user.timezone)
        ? habit.currentStreak + 1
        : 1;
    }

    await habitRepo.save(habit);
  });
}
