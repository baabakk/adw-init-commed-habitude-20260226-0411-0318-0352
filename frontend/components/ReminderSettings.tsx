import React, { useState } from 'react';

type Habit = { id: string; name: string };

type Props = {
  habits: Habit[];
  onCreateReminder: (payload: { habitId: string; time: string; frequency: string; channel: 'sms' | 'telegram' | 'whatsapp' }) => Promise<void>;
};

export default function ReminderSettings({ habits, onCreateReminder }: Props): JSX.Element {
  const [habitId, setHabitId] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('daily');
  const [channel, setChannel] = useState<'sms' | 'telegram' | 'whatsapp'>('sms');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitId) return;
    await onCreateReminder({ habitId, time, frequency, channel });
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Reminder Settings</h3>
      <select value={habitId} onChange={(e) => setHabitId(e.target.value)} required>
        <option value="">Select habit</option>
        {habits.map((h) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekdays">Weekdays</option>
      </select>
      <select value={channel} onChange={(e) => setChannel(e.target.value as 'sms' | 'telegram' | 'whatsapp')}>
        <option value="sms">SMS</option>
        <option value="telegram">Telegram</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      <button type="submit">Save Reminder</button>
    </form>
  );
}
