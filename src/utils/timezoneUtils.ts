export function toUserDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function isConsecutiveDay(previous: Date, current: Date, timezone: string): boolean {
  const prev = new Date(toUserDate(previous, timezone));
  const curr = new Date(toUserDate(current, timezone));
  const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
  return diff === 1;
}
