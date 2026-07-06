import type { Timestamp } from 'firebase/firestore'

export interface BodyWeightLog {
  id: string
  date: string // 'YYYY-MM-DD'
  weightKg: number
  bodyFatPct?: number
  notes?: string
  createdAt: Timestamp
}

export type BodyWeightLogInput = Omit<BodyWeightLog, 'id' | 'createdAt'>
