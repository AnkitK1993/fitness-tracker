import { orderBy, query } from 'firebase/firestore'
import { useUid } from '../context/AuthContext'
import { cardioSessionsCol } from '../lib/firestore/collections'
import {
  addCardioSession,
  deleteCardioSession,
  updateCardioSession,
} from '../lib/firestore/cardioSessions'
import type { CardioSession, CardioSessionInput } from '../types/cardio'
import { useCollection } from './useCollection'

export function useCardioSessions() {
  const uid = useUid()
  const { data, loading, error } = useCollection<CardioSession>(
    () => query(cardioSessionsCol(uid), orderBy('date', 'desc'), orderBy('createdAt', 'desc')),
    [uid],
  )

  return {
    sessions: data,
    loading,
    error,
    add: (input: CardioSessionInput) => addCardioSession(uid, input),
    update: (id: string, input: CardioSessionInput) => updateCardioSession(uid, id, input),
    remove: (id: string) => deleteCardioSession(uid, id),
  }
}
