import { format, parseISO, subDays } from 'date-fns'

/** Today's local date as 'YYYY-MM-DD'. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function daysAgoISO(days: number): string {
  return format(subDays(new Date(), days), 'yyyy-MM-dd')
}

/** 'YYYY-MM-DD' -> 'Mon, 6 Jul' */
export function formatDateShort(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE, d MMM')
}

/** 'YYYY-MM-DD' -> '6 Jul 2026' */
export function formatDateLong(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM yyyy')
}

/** 'YYYY-MM-DD' -> '6/7' for chart axes */
export function formatDateTick(isoDate: string): string {
  return format(parseISO(isoDate), 'd/M')
}
