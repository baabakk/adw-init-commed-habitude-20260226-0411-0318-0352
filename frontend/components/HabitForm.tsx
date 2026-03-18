import React, { useState } from 'react';

type Props = {
  onCreate: (payload: { name: string; goal?: string }) => Promise<void>;
};

export default function HabitForm({ onCreate }: Props): JSX.Element {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name: name.trim(), goal: goal.trim() || undefined });
    setName('');
    setGoal('');
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Create Habit</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" required />
      <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal (optional)" />
      <button type="submit">Add Habit</button>
    </form>
  );
}
