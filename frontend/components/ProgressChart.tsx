import React from 'react';

type Point = { date: string; value: number };

type Props = { data: Point[] };

export default function ProgressChart({ data }: Props): JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="card">
      <h3>Progress (Last 30 Days)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
        {data.map((point) => (
          <div
            key={point.date}
            title={`${point.date}: ${point.value}`}
            style={{
              width: 10,
              height: `${(point.value / max) * 100}%`,
              background: '#10b981',
              borderRadius: 2
            }}
          />
        ))}
      </div>
    </div>
  );
}
