import { AppConfig } from '@constants/config';

export function formatPrice(amount: number): string {
  return `${AppConfig.currencySymbol}${amount.toLocaleString('en-IN')}`;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return 'TBA';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShowDate(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Converts the API's "HH:MM:SS" show time into a display string like "10:30 AM". */
export function formatShowTime(rawTime: string): string {
  const [hStr, mStr] = rawTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return rawTime;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatSeatLabel(row: string, number: number): string {
  return `${row}${number}`;
}

export function formatSeatList(seats: Array<{ row: string; number: number }>): string {
  return seats.map(s => formatSeatLabel(s.row, s.number)).join(', ');
}

