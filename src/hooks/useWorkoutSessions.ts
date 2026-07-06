import { orderBy, query, where } from 'firebase/firestore'
import { useUid } from '../context/AuthContext'
import { workoutSessionsCol } from '../lib/firestore/collections'
import {
  addWorkoutSession,
  deleteWorkoutSession,
  updateWorkoutSession,
} from '../lib/firestore/workoutSessions'
import type { WorkoutSession, WorkoutSessionInput } from '../types/workout'
import { useCollection } from './useCollection'

export function useWorkoutSessions() {
  const uid = useUid()
  const { data, loading, error } = useCollection<WorkoutSession>(
    () => query(workoutSessionsCol(uid), orderBy('date', 'desc'), orderBy('createdAt', 'desc')),
    [uid],
  )

  return {
    sessions: data,
    loading,
    error,
    add: (input: WorkoutSessionInput) => addWorkoutSession(uid, input),
    update: (id: string, input: WorkoutSessionInput) => updateWorkoutSession(uid, id, input),
    remove: (id: string) => deleteWorkoutSession(uid, id),
  }
}

/** Sessions containing a given library exercise, oldest first — for progress charts. */
export function useExerciseProgress(exerciseId: string | null) {
  const uid = useUid()
  return useCollection<WorkoutSession>(
    () =>
      exerciseId
        ? query(workoutSessionsCol(uid), where('exerciseIds', 'array-contains', exerciseId), orderBy('date'))
        : null,
    [uid, exerciseId],
  )
}
