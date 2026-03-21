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

export function formatSeatLabel(row: string, number: number): string {
  return `${row}${number}`;
}

export function formatSeatList(seats: Array<{ row: string; number: number }>): string {
  return seats.map(s => formatSeatLabel(s.row, s.number)).join(', ');
}

export function formatAvailability(available: number, total: number): string {
  const percentage = (available / total) * 100;
  if (percentage === 0) return 'Housefull';
  if (percentage < 20) return 'Fast Filling';
  if (percentage < 50) return 'Filling Fast';
  return 'Available';
}

export function getAvailabilityColor(available: number, total: number): string {
  const percentage = (available / total) * 100;
  if (percentage === 0) return '#EF4444';
  if (percentage < 20) return '#F59E0B';
  if (percentage < 50) return '#3B82F6';
  return '#22C55E';
}
