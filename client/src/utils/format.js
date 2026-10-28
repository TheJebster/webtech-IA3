const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatCurrency = (value) => inr.format(Number(value) || 0);

// All dates show as dd/mm/yyyy (en-GB numeric order)
const DMY = { day: '2-digit', month: '2-digit', year: 'numeric' };

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB', DMY) : '—');

export const formatDateTime = (value) =>
  value
    ? `${formatDate(value)}, ${new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
    : '—';

export function timeAgo(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (seconds >= secs) {
      const n = Math.floor(seconds / secs);
      return `${n} ${unit}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

// Rental dates are stored as UTC midnight, so format them in UTC to avoid off-by-one days
export const formatDay = (value) => (value ? new Date(value).toLocaleDateString('en-GB', { ...DMY, timeZone: 'UTC' }) : '—');

export function formatDayRange(start, end) {
  if (!start) return '—';
  const s = new Date(start).toISOString().slice(0, 10);
  const e = new Date(end).toISOString().slice(0, 10);
  return s === e ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`;
}

// Today's date as YYYY-MM-DD in the user's local timezone (minimum for date fields)
export function todayInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
