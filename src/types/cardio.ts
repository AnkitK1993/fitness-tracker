import type { Timestamp } from 'firebase/firestore'

export type CardioActivityType =
  | 'run'
  | 'bike'
  | 'row'
  | 'swim'
  | 'walk'
  | 'hike'
  | 'elliptical'
  | 'hiit'
  | 'other'

export const CARDIO_ACTIVITIES: CardioActivityType[] = [
  'run',
  'bike',
  'row',
  'swim',
  'walk',
  'hike',
  'elliptical',
  'hiit',
  'other',
]

export const CARDIO_ACTIVITY_LABELS: Record<CardioActivityType, string> = {
  run: 'Run',
  bike: 'Bike',
  row: 'Row',
  swim: 'Swim',
  walk: 'Walk',
  hike: 'Hike',
  elliptical: 'Elliptical',
  hiit: 'HIIT',
  other: 'Other',
}

export interface CardioSession {
  id: string
  date: string // 'YYYY-MM-DD'
  activityType: CardioActivityType
  customActivityName?: string
  durationSec: number
  distanceKm?: number
  calories?: number
  avgHr?: number
  maxHr?: number
  minHr?: number
  heartRateSource: 'manual' | 'bluetooth'
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CardioSessionInput = Omit<CardioSession, 'id' | 'createdAt' | 'updatedAt'>

export function cardioActivityLabel(s: Pick<CardioSession, 'activityType' | 'customActivityName'>): string {
  return s.activityType === 'other' && s.customActivityName
    ? s.customActivityName
    : CARDIO_ACTIVITY_LABELS[s.activityType]
}
