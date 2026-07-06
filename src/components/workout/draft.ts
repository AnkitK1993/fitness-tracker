import { displayToKg, kgToDisplay, round } from '../../lib/units'
import type { WeightUnit } from '../../types/user'
import type { SessionExercise, WorkoutSet } from '../../types/workout'

/**
 * Editable string-field mirror of the session's exercises, so inputs can be
 * empty/partial while typing. Converted to domain types on save.
 */
export interface DraftSet {
  key: number
  type: 'reps' | 'duration'
  reps: string
  weight: string // in display units
  durationSec: string
}

export interface DraftExercise {
  key: number
  exerciseId: string | null
  exerciseName: string
  sets: DraftSet[]
}

let nextKey = 1
export function newKey(): number {
  return nextKey++
}

export function emptySet(type: 'reps' | 'duration'): DraftSet {
  return { key: newKey(), type, reps: '', weight: '', durationSec: '' }
}

export function emptyExercise(): DraftExercise {
  return { key: newKey(), exerciseId: null, exerciseName: '', sets: [emptySet('reps')] }
}

export function toDraft(exercises: SessionExercise[], unit: WeightUnit): DraftExercise[] {
  return exercises.map((ex) => ({
    key: newKey(),
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    sets: ex.sets.map((s) => ({
      key: newKey(),
      type: s.type,
      reps: s.type === 'reps' ? String(s.reps) : '',
      weight:
        s.weightKg !== undefined && s.weightKg !== null ? String(round(kgToDisplay(s.weightKg, unit), 2)) : '',
      durationSec: s.type === 'duration' ? String(s.durationSec) : '',
    })),
  }))
}

/** Drops exercises with no name and sets with no numbers; returns null set for invalid rows. */
export function fromDraft(drafts: DraftExercise[], unit: WeightUnit): SessionExercise[] {
  const result: SessionExercise[] = []
  for (const draft of drafts) {
    const name = draft.exerciseName.trim()
    if (!name) continue
    const sets: WorkoutSet[] = []
    for (const s of draft.sets) {
      if (s.type === 'reps') {
        const reps = parseInt(s.reps, 10)
        const weight = parseFloat(s.weight)
        if (!Number.isFinite(reps) || reps <= 0) continue
        sets.push({ type: 'reps', reps, weightKg: Number.isFinite(weight) ? displayToKg(weight, unit) : 0 })
      } else {
        const duration = parseInt(s.durationSec, 10)
        if (!Number.isFinite(duration) || duration <= 0) continue
        const weight = parseFloat(s.weight)
        sets.push({
          type: 'duration',
          durationSec: duration,
          ...(Number.isFinite(weight) && weight > 0 ? { weightKg: displayToKg(weight, unit) } : {}),
        })
      }
    }
    if (sets.length > 0) result.push({ exerciseId: draft.exerciseId, exerciseName: name, sets })
  }
  return result
}
