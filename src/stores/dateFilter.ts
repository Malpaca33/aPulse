import { atom } from 'nanostores';

export interface DateFilter {
  year: number;
  month: number;
  day: number;
}

export const $dateFilter = atom<DateFilter | null>(null);

export function setDateFilter(filter: DateFilter | null) {
  $dateFilter.set(filter);
}

export function clearDateFilter() {
  $dateFilter.set(null);
}
