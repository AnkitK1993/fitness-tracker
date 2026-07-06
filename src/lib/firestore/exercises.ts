import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase/config'
import type { ExerciseInput } from '../../types/exercise'
import { exercisesCol, pruneUndefined } from './collections'

export async function addExercise(uid: string, input: ExerciseInput): Promise<string> {
  const ref = await addDoc(exercisesCol(uid), {
    ...pruneUndefined(input),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateExercise(uid: string, id: string, input: Partial<ExerciseInput>): Promise<void> {
  await updateDoc(doc(exercisesCol(uid), id), pruneUndefined(input))
}

export async function deleteExercise(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(exercisesCol(uid), id))
}

const STARTER_EXERCISES: ExerciseInput[] = [
  { name: 'Bench Press', category: 'push', isDurationBased: false },
  { name: 'Overhead Press', category: 'push', isDurationBased: false },
  { name: 'Incline Dumbbell Press', category: 'push', isDurationBased: false },
  { name: 'Tricep Pushdown', category: 'push', isDurationBased: false },
  { name: 'Dips', category: 'push', isDurationBased: false },
  { name: 'Pull-up', category: 'pull', isDurationBased: false },
  { name: 'Barbell Row', category: 'pull', isDurationBased: false },
  { name: 'Lat Pulldown', category: 'pull', isDurationBased: false },
  { name: 'Deadlift', category: 'pull', isDurationBased: false },
  { name: 'Bicep Curl', category: 'pull', isDurationBased: false },
  { name: 'Face Pull', category: 'pull', isDurationBased: false },
  { name: 'Squat', category: 'legs', isDurationBased: false },
  { name: 'Leg Press', category: 'legs', isDurationBased: false },
  { name: 'Romanian Deadlift', category: 'legs', isDurationBased: false },
  { name: 'Lunges', category: 'legs', isDurationBased: false },
  { name: 'Leg Curl', category: 'legs', isDurationBased: false },
  { name: 'Calf Raise', category: 'legs', isDurationBased: false },
  { name: 'Plank', category: 'core', isDurationBased: true },
  { name: 'Side Plank', category: 'core', isDurationBased: true },
  { name: 'Crunches', category: 'core', isDurationBased: false },
  { name: 'Hanging Leg Raise', category: 'core', isDurationBased: false },
  { name: 'Russian Twist', category: 'core', isDurationBased: false },
  { name: 'Ab Wheel Rollout', category: 'core', isDurationBased: false },
  { name: 'Cable Crunch', category: 'core', isDurationBased: false },
  { name: 'Dead Bug', category: 'core', isDurationBased: false },
]

export async function seedStarterExercises(uid: string): Promise<void> {
  const batch = writeBatch(db)
  for (const exercise of STARTER_EXERCISES) {
    batch.set(doc(exercisesCol(uid)), { ...exercise, createdAt: serverTimestamp() })
  }
  await batch.commit()
}
