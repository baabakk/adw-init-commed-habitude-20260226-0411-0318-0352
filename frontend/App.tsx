import React, { useEffect, useState } from 'react';
import HabitForm from './components/HabitForm';
import HabitList from './components/HabitList';
import ProgressChart from './components/ProgressChart';
import ReminderSettings from './components/ReminderSettings';
import { apiRequest } from './utils/apiClient';

type Habit = { id: string; name: string; currentStreak: number };

type ProgressResponse = { habitId: string; days: number; data: { date: string; value: number }[] };

export default function App(): JSX.Element {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<{ date: string; value: number }[]>([]);
  const [error, setError] = useState('');

  const loadHabits = async () => {
    try {
      const data = await apiRequest<Habit[]>('/habits');
      setHabits(data);
      if (data[0]) {
        const p = await apiRequest<ProgressResponse>(`/progress/${data[0].id}`);
        setProgress(p.data);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  return (
    <div>
      <h1>Habitude</h1>
      {error && <div className="card" style={{ color: '#b91c1c' }}>{error}</div>}
      <HabitForm onCreate={async (payload) => {
        await apiRequest('/habits', { method: 'POST', body: JSON.stringify(payload) });
        await loadHabits();
      }} />
      <ReminderSettings habits={habits} onCreateReminder={async (payload) => {
        await apiRequest('/reminders', { method: 'POST', body: JSON.stringify(payload) });
      }} />
      <HabitList habits={habits} onComplete={async (habitId) => {
        await apiRequest(`/habits/${habitId}/complete`, { method: 'POST' });
        await loadHabits();
      }} />
      <ProgressChart data={progress} />
    </div>
  );
}
