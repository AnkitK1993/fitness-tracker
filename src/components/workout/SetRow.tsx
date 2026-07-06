import type { WeightUnit } from '../../types/user'
import type { DraftSet } from './draft'

interface SetRowProps {
  set: DraftSet
  index: number
  weightUnit: WeightUnit
  onChange: (updated: DraftSet) => void
  onRemove: () => void
}

export function SetRow({ set, index, weightUnit, onChange, onRemove }: SetRowProps) {
  return (
    <div className="set-row">
      <span className="set-number">{index + 1}</span>
      <div className="set-type-toggle" role="group" aria-label="Set type">
        <button
          type="button"
          className={set.type === 'reps' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => onChange({ ...set, type: 'reps' })}
        >
          Reps
        </button>
        <button
          type="button"
          className={set.type === 'duration' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => onChange({ ...set, type: 'duration' })}
        >
          Time
        </button>
      </div>
      {set.type === 'reps' ? (
        <>
          <label className="set-field">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="10"
              value={set.reps}
              onChange={(e) => onChange({ ...set, reps: e.target.value })}
            />
            <span>reps</span>
          </label>
          <label className="set-field">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              placeholder="0"
              value={set.weight}
              onChange={(e) => onChange({ ...set, weight: e.target.value })}
            />
            <span>{weightUnit}</span>
          </label>
        </>
      ) : (
        <>
          <label className="set-field">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="60"
              value={set.durationSec}
              onChange={(e) => onChange({ ...set, durationSec: e.target.value })}
            />
            <span>sec</span>
          </label>
          <label className="set-field">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              placeholder="+0"
              value={set.weight}
              onChange={(e) => onChange({ ...set, weight: e.target.value })}
            />
            <span>{weightUnit}</span>
          </label>
        </>
      )}
      <button type="button" className="btn btn-ghost btn-icon" onClick={onRemove} aria-label="Remove set">
        ✕
      </button>
    </div>
  )
}
