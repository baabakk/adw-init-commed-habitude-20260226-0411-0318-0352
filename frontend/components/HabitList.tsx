import React from 'react';

type Habit = { id: string; name: string; currentStreak: number };

type Props = {
  habits: Habit[];
  onComplete: (habitId: string) => Promise<void>;
};

export default function HabitList({ habits, onComplete }: Props): JSX.Element {
  return (
    <div className="card">
      <h3>Your Habits</h3>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            <span>
              {habit.name} — 🔥 {habit.currentStreak}
            </span>
            <button onClick={() => onComplete(habit.id)}>Complete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
