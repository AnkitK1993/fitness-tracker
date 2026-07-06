import { useState } from 'react'
import { WeightTrendChart } from '../components/charts/WeightTrendChart'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { useSettings } from '../context/SettingsContext'
import { useBodyWeightLogs } from '../hooks/useBodyWeightLogs'
import { formatDateShort, todayISO } from '../lib/dates'
import { displayToKg, formatWeight, kgToDisplay, round } from '../lib/units'
import type { BodyWeightLog, BodyWeightLogInput } from '../types/weight'

interface WeightFormProps {
  initial?: BodyWeightLog
  onSave: (input: BodyWeightLogInput) => Promise<unknown>
  onDone: () => void
}

function WeightForm({ initial, onSave, onDone }: WeightFormProps) {
  const { settings } = useSettings()
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [weight, setWeight] = useState(
    initial ? String(round(kgToDisplay(initial.weightKg, settings.weightUnit), 1)) : '',
  )
  const [bodyFat, setBodyFat] = useState(initial?.bodyFatPct !== undefined ? String(initial.bodyFatPct) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const weightValue = parseFloat(weight)
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      setError('Enter a valid weight.')
      return
    }
    setError(null)
    setSaving(true)
    const bodyFatValue = parseFloat(bodyFat)
    try {
      await onSave({
        date,
        weightKg: round(displayToKg(weightValue, settings.weightUnit), 2),
        ...(Number.isFinite(bodyFatValue) && bodyFatValue > 0 ? { bodyFatPct: bodyFatValue } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form className="session-form" onSubmit={(e) => void handleSubmit(e)}>
      <div className="form-row">
        <label className="form-field">
          <span>Date</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Weight ({settings.weightUnit})</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Body fat %</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            max={80}
            placeholder="Optional"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
          />
        </label>
      </div>
      <label className="form-field">
        <span>Notes</span>
        <input type="text" placeholder="Optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <span className="spacer" />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export function WeightPage() {
  const { logs, loading, error, add, update, remove } = useBodyWeightLogs()
  const { settings, updateSettings } = useSettings()
  const [editing, setEditing] = useState<BodyWeightLog | null>(null)
  const [deleting, setDeleting] = useState<BodyWeightLog | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  if (loading) return <LoadingSpinner />
  if (error) return <p className="form-error">Failed to load weight logs: {error.message}</p>

  const latest = logs[0]

  const saveGoal = async () => {
    const value = parseFloat(goalInput)
    if (Number.isFinite(value) && value > 0) {
      await updateSettings({ goalWeightKg: round(displayToKg(value, settings.weightUnit), 2) })
    }
    setEditingGoal(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Body weight</h1>
      </div>

      <div className="stat-row">
        <div className="stat-tile card">
          <span className="stat-label">Current</span>
          <span className="stat-value">{latest ? formatWeight(latest.weightKg, settings.weightUnit) : '—'}</span>
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Goal</span>
          {editingGoal ? (
            <span className="stat-edit">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                autoFocus
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={() => void saveGoal()}>
                Set
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="stat-value stat-value-button"
              onClick={() => {
                setGoalInput(
                  settings.goalWeightKg !== undefined
                    ? String(round(kgToDisplay(settings.goalWeightKg, settings.weightUnit), 1))
                    : '',
                )
                setEditingGoal(true)
              }}
            >
              {settings.goalWeightKg !== undefined
                ? formatWeight(settings.goalWeightKg, settings.weightUnit)
                : 'Set goal'}
            </button>
          )}
        </div>
        {latest && settings.goalWeightKg !== undefined && (
          <div className="stat-tile card">
            <span className="stat-label">To goal</span>
            <span className="stat-value">
              {formatWeight(Math.abs(latest.weightKg - settings.goalWeightKg), settings.weightUnit)}
            </span>
          </div>
        )}
      </div>

      {logs.length > 1 && (
        <div className="card chart-card">
          <WeightTrendChart logs={logs} weightUnit={settings.weightUnit} goalWeightKg={settings.goalWeightKg} />
        </div>
      )}

      <div className="card">
        <h2>Log weight</h2>
        <WeightForm onSave={add} onDone={() => undefined} />
      </div>

      {logs.length === 0 ? (
        <EmptyState title="No entries yet" message="Log your first weigh-in above to start the trend." />
      ) : (
        <div className="list">
          {logs.map((log) => (
            <div key={log.id} className="list-item list-item-static">
              <div className="list-item-main">
                <span className="list-item-title">{formatDateShort(log.date)}</span>
                <strong>{formatWeight(log.weightKg, settings.weightUnit)}</strong>
                {log.bodyFatPct !== undefined && <span className="muted">{log.bodyFatPct}% bf</span>}
              </div>
              {log.notes && <div className="list-item-sub">{log.notes}</div>}
              <div className="list-item-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(log)}>
                  Edit
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDeleting(log)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title="Edit entry" onClose={() => setEditing(null)}>
          <WeightForm
            initial={editing}
            onSave={(input) => update(editing.id, input)}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete entry"
          message={`Delete the ${formatDateShort(deleting.date)} weigh-in?`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            void remove(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
