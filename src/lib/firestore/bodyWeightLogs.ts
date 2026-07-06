import { addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { BodyWeightLogInput } from '../../types/weight'
import { bodyWeightLogsCol, pruneUndefined } from './collections'

export async function addBodyWeightLog(uid: string, input: BodyWeightLogInput): Promise<string> {
  const ref = await addDoc(bodyWeightLogsCol(uid), {
    ...pruneUndefined(input),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBodyWeightLog(uid: string, id: string, input: BodyWeightLogInput): Promise<void> {
  await updateDoc(doc(bodyWeightLogsCol(uid), id), pruneUndefined(input))
}

export async function deleteBodyWeightLog(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(bodyWeightLogsCol(uid), id))
}
