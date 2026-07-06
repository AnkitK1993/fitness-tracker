import type { Exercise } from '../../types/exercise'
import type { WeightUnit } from '../../types/user'
import type { DraftExercise } from './draft'
import { emptySet, newKey } from './draft'
import { SetRow } from './SetRow'

interface ExerciseEntryRowProps {
  draft: DraftExercise
  library: Exercise[]
  weightUnit: WeightUnit
  onChange: (updated: DraftExercise) => void
  onRemove: () => void
}

const AD_HOC = '__adhoc__'

export function ExerciseEntryRow({ draft, library, weightUnit, onChange, onRemove }: ExerciseEntryRowProps) {
  const selectValue = draft.exerciseId ?? (draft.exerciseName ? AD_HOC : '')

  const handleSelect = (value: string) => {
    if (value === AD_HOC) {
      onChange({ ...draft, exerciseId: null, exerciseName: '' })
      return
    }
    const exercise = library.find((e) => e.id === value)
    if (!exercise) return
    // when the exercise has no recorded sets yet, default set type to the library hint
    const sets =
      draft.sets.length === 1 && draft.sets[0].reps === '' && draft.sets[0].durationSec === ''
        ? [emptySet(exercise.isDurationBased ? 'duration' : 'reps')]
        : draft.sets
    onChange({ ...draft, exerciseId: exercise.id, exerciseName: exercise.name, sets })
  }

  return (
    <div className="exercise-entry card">
      <div className="exercise-entry-header">
        <select value={selectValue} onChange={(e) => handleSelect(e.target.value)} aria-label="Exercise">
          <option value="" disabled>
            Choose exercise…
          </option>
          {library.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
          <option value={AD_HOC}>✏️ Custom (type a name)</option>
        </select>
        {selectValue === AD_HOC && (
          <input
            type="text"
            placeholder="Exercise name"
            value={draft.exerciseName}
            onChange={(e) => onChange({ ...draft, exerciseName: e.target.value })}
          />
        )}
        <button type="button" className="btn btn-ghost btn-icon" onClick={onRemove} aria-label="Remove exercise">
          🗑
        </button>
      </div>
      <div className="set-list">
        {draft.sets.map((set, i) => (
          <SetRow
            key={set.key}
            set={set}
            index={i}
            weightUnit={weightUnit}
            onChange={(updated) => onChange({ ...draft, sets: draft.sets.map((s) => (s.key === set.key ? updated : s)) })}
            onRemove={() => onChange({ ...draft, sets: draft.sets.filter((s) => s.key !== set.key) })}
          />
        ))}
      </div>
      <button
        type="button"
        className="btn btn-subtle"
        onClick={() => {
          const last = draft.sets[draft.sets.length - 1]
          const next = last ? { ...last, key: newKey() } : emptySet('reps')
          onChange({ ...draft, sets: [...draft.sets, next] })
        }}
      >
        + Add set
      </button>
    </div>
  )
}
