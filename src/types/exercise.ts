import type { Timestamp } from 'firebase/firestore'

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'custom'

export const EXERCISE_CATEGORIES: ExerciseCategory[] = ['push', 'pull', 'legs', 'core', 'custom']

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  isDurationBased: boolean
  archived?: boolean
  createdAt: Timestamp
}

export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt'>
