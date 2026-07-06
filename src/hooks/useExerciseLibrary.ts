import { orderBy, query } from 'firebase/firestore'
import { useUid } from '../context/AuthContext'
import { exercisesCol } from '../lib/firestore/collections'
import { addExercise, deleteExercise, seedStarterExercises, updateExercise } from '../lib/firestore/exercises'
import type { Exercise, ExerciseInput } from '../types/exercise'
import { useCollection } from './useCollection'

export function useExerciseLibrary() {
  const uid = useUid()
  const { data, loading, error } = useCollection<Exercise>(
    () => query(exercisesCol(uid), orderBy('name')),
    [uid],
  )

  return {
    exercises: data,
    active: data.filter((e) => !e.archived),
    loading,
    error,
    add: (input: ExerciseInput) => addExercise(uid, input),
    update: (id: string, input: Partial<ExerciseInput>) => updateExercise(uid, id, input),
    remove: (id: string) => deleteExercise(uid, id),
    seedStarters: () => seedStarterExercises(uid),
  }
}
