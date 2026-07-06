import type { Timestamp } from 'firebase/firestore'

export type SplitType = 'push' | 'pull' | 'legs' | 'core' | 'custom'

export const SPLIT_TYPES: SplitType[] = ['push', 'pull', 'legs', 'core', 'custom']

export const SPLIT_LABELS: Record<SplitType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
  custom: 'Custom / Full body',
}

export type WorkoutSet =
  | { type: 'reps'; reps: number; weightKg: number }
  | { type: 'duration'; durationSec: number; weightKg?: number }

export interface SessionExercise {
  exerciseId: string | null // null = ad-hoc entry, not in library
  exerciseName: string
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id: string
  date: string // 'YYYY-MM-DD'
  splitType: SplitType
  notes?: string
  exerciseIds: string[]
  exercises: SessionExercise[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type WorkoutSessionInput = Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt' | 'exerciseIds'>

/** Heaviest weight lifted in a session's sets for one exercise; falls back to longest duration. */
export function bestSetSummary(sets: WorkoutSet[]): { weightKg?: number; durationSec?: number } {
  let weightKg: number | undefined
  let durationSec: number | undefined
  for (const s of sets) {
    if (s.type === 'reps') {
      if (weightKg === undefined || s.weightKg > weightKg) weightKg = s.weightKg
    } else {
      if (s.weightKg !== undefined && (weightKg === undefined || s.weightKg > weightKg)) weightKg = s.weightKg
      if (durationSec === undefined || s.durationSec > durationSec) durationSec = s.durationSec
    }
  }
  return { weightKg, durationSec }
}

/** Total volume (sum reps x weight) across a session, in kg. */
export function sessionVolumeKg(session: WorkoutSession): number {
  let total = 0
  for (const ex of session.exercises) {
    for (const s of ex.sets) {
      if (s.type === 'reps') total += s.reps * s.weightKg
    }
  }
  return total
}
