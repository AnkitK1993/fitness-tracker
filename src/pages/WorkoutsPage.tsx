import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SimpleTrendChart } from '../components/charts/SimpleTrendChart'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SessionListItem } from '../components/workout/SessionListItem'
import { SplitTabs } from '../components/workout/SplitTabs'
import { useSettings } from '../context/SettingsContext'
import { useExerciseLibrary } from '../hooks/useExerciseLibrary'
import { useExerciseProgress, useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { formatDuration, formatWeight, kgToDisplay, round } from '../lib/units'
import type { Exercise } from '../types/exercise'
import type { SplitType, WorkoutSession } from '../types/workout'
import { bestSetSummary } from '../types/workout'

type Filter = 'all' | SplitType

/** Best-set trend for one library exercise across sessions. */
export function ExerciseProgressCard({ exercises }: { exercises: Exercise[] }) {
  const { settings } = useSettings()
  const [exerciseId, setExerciseId] = useState<string>('')
  const { data: sessions, loading } = useExerciseProgress(exerciseId || null)
  const selected = exercises.find((e) => e.id === exerciseId)

  const points = useMemo(() => {
    if (!selected) return []
    const result: { date: string; value: number }[] = []
    for (const session of sessions) {
      const entry = session.exercises.find((e) => e.exerciseId === selected.id)
      if (!entry) continue
      const best = bestSetSummary(entry.sets)
      const value = selected.isDurationBased
        ? best.durationSec
        : best.weightKg !== undefined
          ? round(kgToDisplay(best.weightKg, settings.weightUnit), 1)
          : undefined
      if (value !== undefined) result.push({ date: session.date, value })
    }
    return result
  }, [sessions, selected, settings.weightUnit])

  return (
    <div className="card chart-card">
      <div className="chart-card-header">
        <h2>Progress</h2>
        <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} aria-label="Exercise to chart">
          <option value="">Choose exercise…</option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      {exerciseId === '' ? (
        <p className="hint">Pick an exercise to see your best set over time.</p>
      ) : loading ? (
        <LoadingSpinner />
      ) : points.length < 2 ? (
        <p className="hint">Log this exercise in at least two sessions to see a trend.</p>
      ) : (
        <SimpleTrendChart
          data={points}
          name={selected?.isDurationBased ? 'Longest hold' : 'Best set'}
          formatValue={(v) =>
            selected?.isDurationBased ? formatDuration(v) : `${v} ${settings.weightUnit}`
          }
        />
      )}
    </div>
  )
}

export function SessionList({
  sessions,
  basePath,
  emptyTitle,
  emptyMessage,
  newPath,
}: {
  sessions: WorkoutSession[]
  basePath: string
  emptyTitle: string
  emptyMessage: string
  newPath: string
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={
          <Link to={newPath} className="btn btn-primary">
            + Log session
          </Link>
        }
      />
    )
  }
  return (
    <div className="list">
      {sessions.map((s) => (
        <SessionListItem key={s.id} session={s} basePath={basePath} />
      ))}
    </div>
  )
}

export function WorkoutsPage() {
  const { sessions, loading, error } = useWorkoutSessions()
  const { active: exercises } = useExerciseLibrary()
  const { settings } = useSettings()
  const [filter, setFilter] = useState<Filter>('all')

  if (loading) return <LoadingSpinner />
  if (error) return <p className="form-error">Failed to load sessions: {error.message}</p>

  const visible = filter === 'all' ? sessions : sessions.filter((s) => s.splitType === filter)
  const thisWeekVolume = sessions
    .filter((s) => new Date(s.date) >= new Date(Date.now() - 7 * 24 * 3600 * 1000))
    .reduce((sum, s) => sum + s.exercises.flatMap((e) => e.sets).reduce((v, set) => (set.type === 'reps' ? v + set.reps * set.weightKg : v), 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workouts</h1>
        <Link to="/workouts/new" className="btn btn-primary">
          + Log session
        </Link>
      </div>

      {thisWeekVolume > 0 && (
        <p className="muted">Volume last 7 days: {formatWeight(thisWeekVolume, settings.weightUnit, 0)}</p>
      )}

      <SplitTabs
        options={[
          { value: 'all' as const, label: 'All' },
          { value: 'push' as const, label: 'Push' },
          { value: 'pull' as const, label: 'Pull' },
          { value: 'legs' as const, label: 'Legs' },
          { value: 'core' as const, label: 'Core' },
          { value: 'custom' as const, label: 'Custom' },
        ]}
        current={filter}
        onChange={setFilter}
      />

      <SessionList
        sessions={visible}
        basePath="/workouts"
        newPath="/workouts/new"
        emptyTitle="No sessions yet"
        emptyMessage="Log your first strength session to start tracking."
      />

      <ExerciseProgressCard exercises={exercises} />
    </div>
  )
}
