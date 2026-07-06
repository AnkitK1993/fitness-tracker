import { useMemo, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { useExerciseLibrary } from '../../hooks/useExerciseLibrary'
import { todayISO } from '../../lib/dates'
import type { SplitType, WorkoutSession, WorkoutSessionInput } from '../../types/workout'
import { SPLIT_LABELS, SPLIT_TYPES } from '../../types/workout'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { DraftExercise } from './draft'
import { emptyExercise, fromDraft, toDraft } from './draft'
import { ExerciseEntryRow } from './ExerciseEntryRow'

interface SessionFormProps {
  initial?: WorkoutSession
  lockedSplit?: SplitType
  onSave: (input: WorkoutSessionInput) => Promise<void>
  onDelete?: () => Promise<void>
  onDone: () => void
}

export function SessionForm({ initial, lockedSplit, onSave, onDelete, onDone }: SessionFormProps) {
  const { settings } = useSettings()
  const { active: library } = useExerciseLibrary()

  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [splitType, setSplitType] = useState<SplitType>(lockedSplit ?? initial?.splitType ?? 'push')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [drafts, setDrafts] = useState<DraftExercise[]>(() =>
    initial ? toDraft(initial.exercises, settings.weightUnit) : [emptyExercise()],
  )
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // For core sessions, surface core exercises first in the picker
  const sortedLibrary = useMemo(() => {
    return [...library].sort((a, b) => {
      const aMatch = a.category === splitType ? 0 : 1
      const bMatch = b.category === splitType ? 0 : 1
      return aMatch - bMatch || a.name.localeCompare(b.name)
    })
  }, [library, splitType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const exercises = fromDraft(drafts, settings.weightUnit)
    if (exercises.length === 0) {
      setFormError('Add at least one exercise with a completed set (reps or seconds).')
      return
    }
    setFormError(null)
    setSaving(true)
    try {
      await onSave({
        date,
        splitType,
        exercises,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      onDone()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save session')
      setSaving(false)
    }
  }

  return (
    <form className="session-form" onSubmit={(e) => void handleSubmit(e)}>
      <div className="form-row">
        <label className="form-field">
          <span>Date</span>
          <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Split</span>
          <select
            value={splitType}
            disabled={!!lockedSplit}
            onChange={(e) => setSplitType(e.target.value as SplitType)}
          >
            {SPLIT_TYPES.map((s) => (
              <option key={s} value={s}>
                {SPLIT_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="exercise-list">
        {drafts.map((draft) => (
          <ExerciseEntryRow
            key={draft.key}
            draft={draft}
            library={sortedLibrary}
            weightUnit={settings.weightUnit}
            onChange={(updated) => setDrafts(drafts.map((d) => (d.key === draft.key ? updated : d)))}
            onRemove={() => setDrafts(drafts.filter((d) => d.key !== draft.key))}
          />
        ))}
      </div>
      <button type="button" className="btn" onClick={() => setDrafts([...drafts, emptyExercise()])}>
        + Add exercise
      </button>

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
          title="Delete session"
          message="This will permanently delete this session."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            void onDelete().then(onDone)
          }}
        />
      )}
    </form>
  )
}
