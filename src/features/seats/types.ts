import { SeatSection, SeatStatus } from '@ctypes/models';

export interface SeatItemState {
  id: string;
  row: string;
  number: number;
  section: SeatSection;
  status: SeatStatus;
  price: number;
}

export interface SeatGridProps {
  showId: string;
}
