import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { CardioSessionInput } from '../../types/cardio'
import { cardioSessionsCol, pruneUndefined } from './collections'

export async function addCardioSession(uid: string, input: CardioSessionInput): Promise<string> {
  const ref = await addDoc(cardioSessionsCol(uid), {
    ...pruneUndefined(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCardioSession(uid: string, id: string, input: CardioSessionInput): Promise<void> {
  await updateDoc(doc(cardioSessionsCol(uid), id), {
    ...pruneUndefined(input),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCardioSession(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(cardioSessionsCol(uid), id))
}
