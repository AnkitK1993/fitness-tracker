import type { DistanceUnit, WeightUnit } from '../types/user'

const KG_PER_LB = 0.45359237
const KM_PER_MI = 1.609344

export function kgToDisplay(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB
}

export function displayToKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * KG_PER_LB
}

export function kmToDisplay(km: number, unit: DistanceUnit): number {
  return unit === 'km' ? km : km / KM_PER_MI
}

export function displayToKm(value: number, unit: DistanceUnit): number {
  return unit === 'km' ? value : value * KM_PER_MI
}

export function formatWeight(kg: number, unit: WeightUnit, decimals = 1): string {
  return `${round(kgToDisplay(kg, unit), decimals)} ${unit}`
}

export function formatDistance(km: number, unit: DistanceUnit, decimals = 2): string {
  return `${round(kmToDisplay(km, unit), decimals)} ${unit}`
}

/** "45s", "12:30", "1h 05m" */
export function formatDuration(totalSec: number): string {
  const sec = Math.round(totalSec)
  if (sec < 60) return `${sec}s`
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(s).padStart(2, '0')}`
}

/** min/km or min/mi as "5:30 /km" */
export function formatPace(durationSec: number, distanceKm: number, unit: DistanceUnit): string {
  if (distanceKm <= 0) return '—'
  const distance = kmToDisplay(distanceKm, unit)
  const secPerUnit = durationSec / distance
  const m = Math.floor(secPerUnit / 60)
  const s = Math.round(secPerUnit % 60)
  return `${m}:${String(s).padStart(2, '0')} /${unit}`
}

export function round(value: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}
