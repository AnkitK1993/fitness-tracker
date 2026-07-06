import { collection, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export const userDoc = (uid: string) => doc(db, 'users', uid)
export const bodyWeightLogsCol = (uid: string) => collection(db, 'users', uid, 'bodyWeightLogs')
export const exercisesCol = (uid: string) => collection(db, 'users', uid, 'exercises')
export const workoutSessionsCol = (uid: string) => collection(db, 'users', uid, 'workoutSessions')
export const cardioSessionsCol = (uid: string) => collection(db, 'users', uid, 'cardioSessions')

/** Firestore rejects `undefined` field values — strip them before any write. */
export function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}
