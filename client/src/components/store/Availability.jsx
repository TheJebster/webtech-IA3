// Availability for the chosen dates: green = plenty, amber = running low, red = none left
export default function Availability({ available, total, compact = false }) {
  const level = available === 0 ? 'none' : available <= Math.max(1, Math.ceil(total * 0.25)) ? 'low' : 'ok';
  const text = available === 0 ? 'Unavailable' : compact ? `${available} available` : `${available} of ${total} available for your dates`;
  return <span className={`avail avail-${level}`}>{text}</span>;
}
