import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { WorkoutSessionInput } from '../../types/workout'
import { pruneUndefined, workoutSessionsCol } from './collections'

function withDenormalizedIds(input: WorkoutSessionInput) {
  const exerciseIds = [
    ...new Set(input.exercises.map((e) => e.exerciseId).filter((id): id is string => id !== null)),
  ]
  return { ...pruneUndefined(input), exerciseIds }
}

export async function addWorkoutSession(uid: string, input: WorkoutSessionInput): Promise<string> {
  const ref = await addDoc(workoutSessionsCol(uid), {
    ...withDenormalizedIds(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateWorkoutSession(uid: string, id: string, input: WorkoutSessionInput): Promise<void> {
  await updateDoc(doc(workoutSessionsCol(uid), id), {
    ...withDenormalizedIds(input),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWorkoutSession(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(workoutSessionsCol(uid), id))
}
