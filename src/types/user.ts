import type { Timestamp } from 'firebase/firestore'

export type WeightUnit = 'kg' | 'lb'
export type DistanceUnit = 'km' | 'mi'
export type Theme = 'light' | 'dark' | 'system'

export interface UserSettings {
  weightUnit: WeightUnit
  distanceUnit: DistanceUnit
  theme: Theme
  goalWeightKg?: number
}

export interface UserProfile {
  displayName: string
  email: string
  createdAt: Timestamp
  settings: UserSettings
}

export const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'kg',
  distanceUnit: 'km',
  theme: 'system',
}
