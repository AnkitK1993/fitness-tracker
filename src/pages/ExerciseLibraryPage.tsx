import { useState } from 'react'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { SplitTabs } from '../components/workout/SplitTabs'
import { useExerciseLibrary } from '../hooks/useExerciseLibrary'
import type { Exercise, ExerciseCategory, ExerciseInput } from '../types/exercise'
import { EXERCISE_CATEGORIES } from '../types/exercise'

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
  custom: 'Other',
}

interface ExerciseFormProps {
  initial?: Exercise
  onSave: (input: ExerciseInput) => Promise<unknown>
  onDone: () => void
}

function ExerciseForm({ initial, onSave, onDone }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<ExerciseCategory>(initial?.category ?? 'push')
  const [isDurationBased, setIsDurationBased] = useState(initial?.isDurationBased ?? false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), category, isDurationBased })
    onDone()
  }

  return (
    <form className="session-form" onSubmit={(e) => void handleSubmit(e)}>
      <label className="form-field">
        <span>Name</span>
        <input type="text" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="form-row">
        <label className="form-field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
            {EXERCISE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field form-field-checkbox">
          <input type="checkbox" checked={isDurationBased} onChange={(e) => setIsDurationBased(e.target.checked)} />
          <span>Time-based (e.g. plank)</span>
        </label>
      </div>
      <div className="form-actions">
        <span className="spacer" />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export function ExerciseLibraryPage() {
  const { exercises, loading, error, add, update, remove, seedStarters } = useExerciseLibrary()
  const [filter, setFilter] = useState<'all' | ExerciseCategory>('all')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [deleting, setDeleting] = useState<Exercise | null>(null)
  const [seeding, setSeeding] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error) return <p className="form-error">Failed to load exercises: {error.message}</p>

  const visible = exercises.filter((e) => filter === 'all' || e.category === filter)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Exercise library</h1>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          + Add exercise
        </button>
      </div>

      <SplitTabs
        options={[
          { value: 'all' as const, label: 'All' },
          ...EXERCISE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
        ]}
        current={filter}
        onChange={setFilter}
      />

      {exercises.length === 0 ? (
        <EmptyState
          title="Library is empty"
          message="Add exercises yourself, or start with a set of common push/pull/legs/core movements."
          action={
            <button
              type="button"
              className="btn btn-primary"
              disabled={seeding}
              onClick={() => {
                setSeeding(true)
                void seedStarters().finally(() => setSeeding(false))
              }}
            >
              {seeding ? 'Adding…' : 'Add starter exercises'}
            </button>
          }
        />
      ) : (
        <div className="list">
          {visible.map((exercise) => (
            <div key={exercise.id} className={exercise.archived ? 'list-item list-item-static archived' : 'list-item list-item-static'}>
              <div className="list-item-main">
                <span className={`badge badge-${exercise.category}`}>{CATEGORY_LABELS[exercise.category]}</span>
                <span className="list-item-title">{exercise.name}</span>
                {exercise.isDurationBased && <span className="muted">⏱ time-based</span>}
                {exercise.archived && <span className="muted">(archived)</span>}
              </div>
              <div className="list-item-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(exercise)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void update(exercise.id, { archived: !exercise.archived })}
                >
                  {exercise.archived ? 'Restore' : 'Archive'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDeleting(exercise)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <Modal title="Add exercise" onClose={() => setAdding(false)}>
          <ExerciseForm onSave={add} onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit exercise" onClose={() => setEditing(null)}>
          <ExerciseForm initial={editing} onSave={(input) => update(editing.id, input)} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete exercise"
          message={`Delete "${deleting.name}" from your library? Past sessions keep their history. Consider archiving instead.`}
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
