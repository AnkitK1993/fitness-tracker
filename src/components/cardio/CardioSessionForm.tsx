import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { todayISO } from '../../lib/dates'
import { displayToKm, kmToDisplay, round } from '../../lib/units'
import type { CardioActivityType, CardioSession, CardioSessionInput } from '../../types/cardio'
import { CARDIO_ACTIVITIES, CARDIO_ACTIVITY_LABELS } from '../../types/cardio'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { LiveSessionResult } from './LiveSessionPanel'
import { LiveSessionPanel } from './LiveSessionPanel'

interface CardioSessionFormProps {
  initial?: CardioSession
  showLivePanel?: boolean
  onSave: (input: CardioSessionInput) => Promise<void>
  onDelete?: () => Promise<void>
  onDone: () => void
}

function num(value: string): number | undefined {
  const n = parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function CardioSessionForm({ initial, showLivePanel, onSave, onDelete, onDone }: CardioSessionFormProps) {
  const { settings } = useSettings()

  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [activityType, setActivityType] = useState<CardioActivityType>(initial?.activityType ?? 'run')
  const [customActivityName, setCustomActivityName] = useState(initial?.customActivityName ?? '')
  const [minutes, setMinutes] = useState(initial ? String(Math.floor(initial.durationSec / 60)) : '')
  const [seconds, setSeconds] = useState(initial ? String(initial.durationSec % 60) : '')
  const [distance, setDistance] = useState(
    initial?.distanceKm !== undefined ? String(round(kmToDisplay(initial.distanceKm, settings.distanceUnit), 2)) : '',
  )
  const [calories, setCalories] = useState(initial?.calories !== undefined ? String(initial.calories) : '')
  const [avgHr, setAvgHr] = useState(initial?.avgHr !== undefined ? String(initial.avgHr) : '')
  const [maxHr, setMaxHr] = useState(initial?.maxHr !== undefined ? String(initial.maxHr) : '')
  const [minHr, setMinHr] = useState(initial?.minHr !== undefined ? String(initial.minHr) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [hrSource, setHrSource] = useState<'manual' | 'bluetooth'>(initial?.heartRateSource ?? 'manual')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleLiveStop = ({ durationSec, hrStats }: LiveSessionResult) => {
    setMinutes(String(Math.floor(durationSec / 60)))
    setSeconds(String(durationSec % 60))
    if (hrStats) {
      setAvgHr(String(hrStats.avg))
      setMaxHr(String(hrStats.max))
      setMinHr(String(hrStats.min))
      setHrSource('bluetooth')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const durationSec = Math.round((num(minutes) ?? 0) * 60 + (num(seconds) ?? 0))
    if (durationSec <= 0) {
      setFormError('Enter a duration.')
      return
    }
    setFormError(null)
    setSaving(true)
    const distanceValue = num(distance)
    try {
      await onSave({
        date,
        activityType,
        durationSec,
        heartRateSource: hrSource,
        ...(activityType === 'other' && customActivityName.trim()
          ? { customActivityName: customActivityName.trim() }
          : {}),
        ...(distanceValue !== undefined && distanceValue > 0
          ? { distanceKm: round(displayToKm(distanceValue, settings.distanceUnit), 3) }
          : {}),
        ...(num(calories) !== undefined ? { calories: num(calories) } : {}),
        ...(num(avgHr) !== undefined ? { avgHr: num(avgHr) } : {}),
        ...(num(maxHr) !== undefined ? { maxHr: num(maxHr) } : {}),
        ...(num(minHr) !== undefined ? { minHr: num(minHr) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      onDone()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save session')
      setSaving(false)
    }
  }

  return (
    <div className="cardio-form-wrap">
      {showLivePanel && <LiveSessionPanel onStop={handleLiveStop} />}

      <form className="session-form" onSubmit={(e) => void handleSubmit(e)}>
        <div className="form-row">
          <label className="form-field">
            <span>Date</span>
            <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Activity</span>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value as CardioActivityType)}>
              {CARDIO_ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {CARDIO_ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </label>
          {activityType === 'other' && (
            <label className="form-field">
              <span>Activity name</span>
              <input
                type="text"
                placeholder="e.g. Stair climber"
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className="form-row">
          <label className="form-field">
            <span>Duration (min)</span>
            <input type="number" inputMode="numeric" min={0} value={minutes} placeholder="30" onChange={(e) => setMinutes(e.target.value)} />
          </label>
          <label className="form-field">
            <span>(sec)</span>
            <input type="number" inputMode="numeric" min={0} max={59} value={seconds} placeholder="0" onChange={(e) => setSeconds(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Distance ({settings.distanceUnit})</span>
            <input type="number" inputMode="decimal" min={0} step="0.01" value={distance} placeholder="5.0" onChange={(e) => setDistance(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Calories</span>
            <input type="number" inputMode="numeric" min={0} value={calories} placeholder="—" onChange={(e) => setCalories(e.target.value)} />
          </label>
        </div>

        <div className="form-row">
          <label className="form-field">
            <span>Avg HR</span>
            <input type="number" inputMode="numeric" min={0} value={avgHr} placeholder="—" onChange={(e) => { setAvgHr(e.target.value); setHrSource('manual') }} />
          </label>
          <label className="form-field">
            <span>Max HR</span>
            <input type="number" inputMode="numeric" min={0} value={maxHr} placeholder="—" onChange={(e) => { setMaxHr(e.target.value); setHrSource('manual') }} />
          </label>
          <label className="form-field">
            <span>Min HR</span>
            <input type="number" inputMode="numeric" min={0} value={minHr} placeholder="—" onChange={(e) => { setMinHr(e.target.value); setHrSource('manual') }} />
          </label>
          {hrSource === 'bluetooth' && <span className="badge badge-core">📡 from sensor</span>}
        </div>

        <label className="form-field">
          <span>Notes</span>
          <textarea rows={2} value={notes} placeholder="Optional" onChange={(e) => setNotes(e.target.value)} />
        </label>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onDone}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save session'}
          </button>
        </div>

        {confirmingDelete && onDelete && (
          <ConfirmDialog
            title="Delete cardio session"
            message="This will permanently delete this session."
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => {
              void onDelete().then(onDone)
            }}
          />
        )}
      </form>
    </div>
  )
}
