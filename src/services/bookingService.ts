import { Booking, PaymentMethod, Seat, Show } from '@ctypes/models';
import { MockDelay } from '@constants/config';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

let mockBookings: Booking[] = [];

function generateBookingId(): string {
  return `CH${Math.floor(20000 + Math.random() * 9999)}`;
}

export async function createBooking(params: {
  movie: { id: string; title: string; posterUrl: string };
  theatre: { id: string; name: string };
  show: Show;
  seats: Seat[];
  paymentMethod: PaymentMethod;
  // Pre-computed by useBookingStore (getConvenienceFee/getGrandTotal) so the fee/GST
  // formula lives in exactly one place instead of being re-derived here too.
  convenienceFee: number;
  totalAmount: number;
}): Promise<Booking> {
  await delay(MockDelay * 2); // Simulate payment processing

  const subtotal = params.seats.reduce((sum, s) => sum + s.price, 0);

  const booking: Booking = {
    id: generateBookingId(),
    movieId: params.movie.id,
    movieTitle: params.movie.title,
    theatreId: params.theatre.id,
    theatreName: params.theatre.name,
    showId: params.show.id,
    showTime: params.show.time,
    showDate: params.show.date,
    showFormat: params.show.format,
    seats: params.seats.map(s => ({ ...s, status: 'booked' })),
    subtotal,
    convenienceFee: params.convenienceFee,
    totalAmount: params.totalAmount,
    bookingDate: new Date().toISOString(),
    status: 'confirmed',
    paymentMethod: params.paymentMethod,
    posterUrl: params.movie.posterUrl,
  };

  mockBookings = [booking, ...mockBookings];
  return booking;
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await delay(MockDelay / 2);
  return mockBookings.find(b => b.id === id);
}

export async function getUserBookings(): Promise<Booking[]> {
  await delay(MockDelay);
  return mockBookings;
}

export async function cancelBooking(id: string): Promise<boolean> {
  await delay(MockDelay);
  const idx = mockBookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  mockBookings[idx] = { ...mockBookings[idx], status: 'cancelled' };
  return true;
}
