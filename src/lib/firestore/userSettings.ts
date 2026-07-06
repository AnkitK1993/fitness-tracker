import { deleteField, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { UserSettings } from '../../types/user'
import { DEFAULT_SETTINGS } from '../../types/user'
import { pruneUndefined, userDoc } from './collections'

export async function createUserProfile(uid: string, displayName: string, email: string): Promise<void> {
  await setDoc(userDoc(uid), {
    displayName,
    email,
    createdAt: serverTimestamp(),
    settings: DEFAULT_SETTINGS,
  })
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const updates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(pruneUndefined(settings))) {
    updates[`settings.${key}`] = value
  }
  await updateDoc(userDoc(uid), updates)
}

export async function clearGoalWeight(uid: string): Promise<void> {
  await updateDoc(userDoc(uid), { 'settings.goalWeightKg': deleteField() })
}
