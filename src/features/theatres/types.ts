import { ShowFormat } from '@ctypes/models';

export interface ShowGroup {
  date: string;
  shows: import('@ctypes/models').Show[];
}

export type FormatFilter = ShowFormat | 'all';
