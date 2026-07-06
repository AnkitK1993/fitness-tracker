import { orderBy, query } from 'firebase/firestore'
import { useUid } from '../context/AuthContext'
import { bodyWeightLogsCol } from '../lib/firestore/collections'
import {
  addBodyWeightLog,
  deleteBodyWeightLog,
  updateBodyWeightLog,
} from '../lib/firestore/bodyWeightLogs'
import type { BodyWeightLog, BodyWeightLogInput } from '../types/weight'
import { useCollection } from './useCollection'

export function useBodyWeightLogs() {
  const uid = useUid()
  const { data, loading, error } = useCollection<BodyWeightLog>(
    () => query(bodyWeightLogsCol(uid), orderBy('date', 'desc'), orderBy('createdAt', 'desc')),
    [uid],
  )

  return {
    logs: data,
    loading,
    error,
    add: (input: BodyWeightLogInput) => addBodyWeightLog(uid, input),
    update: (id: string, input: BodyWeightLogInput) => updateBodyWeightLog(uid, id, input),
    remove: (id: string) => deleteBodyWeightLog(uid, id),
  }
}
