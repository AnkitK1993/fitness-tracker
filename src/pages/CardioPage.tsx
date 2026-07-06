import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SimpleTrendChart } from '../components/charts/SimpleTrendChart'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SplitTabs } from '../components/workout/SplitTabs'
import { useSettings } from '../context/SettingsContext'
import { useCardioSessions } from '../hooks/useCardioSessions'
import { formatDateShort } from '../lib/dates'
import { formatDistance, formatDuration, formatPace, kmToDisplay, round } from '../lib/units'
import type { CardioActivityType } from '../types/cardio'
import { CARDIO_ACTIVITIES, CARDIO_ACTIVITY_LABELS, cardioActivityLabel } from '../types/cardio'

type Filter = 'all' | CardioActivityType
type Metric = 'distance' | 'duration'

export function CardioPage() {
  const { sessions, loading, error } = useCardioSessions()
  const { settings } = useSettings()
  const [filter, setFilter] = useState<Filter>('all')
  const [metric, setMetric] = useState<Metric>('distance')

  const visible = useMemo(
    () => (filter === 'all' ? sessions : sessions.filter((s) => s.activityType === filter)),
    [sessions, filter],
  )

  const chartPoints = useMemo(() => {
    const points = [...visible]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => ({
        date: s.date,
        value:
          metric === 'distance'
            ? s.distanceKm !== undefined
              ? round(kmToDisplay(s.distanceKm, settings.distanceUnit), 2)
              : undefined
            : round(s.durationSec / 60, 1),
      }))
    return points.filter((p): p is { date: string; value: number } => p.value !== undefined)
  }, [visible, metric, settings.distanceUnit])

  if (loading) return <LoadingSpinner />
  if (error) return <p className="form-error">Failed to load cardio sessions: {error.message}</p>

  const usedActivities = CARDIO_ACTIVITIES.filter((a) => sessions.some((s) => s.activityType === a))

  return (
    <div className="page">
      <div className="page-header">
        <h1>Cardio</h1>
        <Link to="/cardio/new" className="btn btn-primary">
          + Log cardio
        </Link>
      </div>

      {usedActivities.length > 1 && (
        <SplitTabs
          options={[
            { value: 'all' as const, label: 'All' },
            ...usedActivities.map((a) => ({ value: a, label: CARDIO_ACTIVITY_LABELS[a] })),
          ]}
          current={filter}
          onChange={setFilter}
        />
      )}

      {chartPoints.length > 1 && (
        <div className="card chart-card">
          <div className="chart-card-header">
            <h2>Trend</h2>
            <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} aria-label="Metric">
              <option value="distance">Distance ({settings.distanceUnit})</option>
              <option value="duration">Duration (min)</option>
            </select>
          </div>
          <SimpleTrendChart
            data={chartPoints}
            name={metric === 'distance' ? 'Distance' : 'Duration'}
            formatValue={(v) => (metric === 'distance' ? `${v} ${settings.distanceUnit}` : formatDuration(v * 60))}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title="No cardio yet"
          message="Log a run, ride, swim — or start a live session with a heart-rate monitor."
          action={
            <Link to="/cardio/new" className="btn btn-primary">
              + Log cardio
            </Link>
          }
        />
      ) : (
        <div className="list">
          {visible.map((s) => (
            <Link key={s.id} to={`/cardio/${s.id}`} className="list-item">
              <div className="list-item-main">
                <span className="badge badge-cardio">{cardioActivityLabel(s)}</span>
                <span className="list-item-title">{formatDateShort(s.date)}</span>
              </div>
              <div className="list-item-meta">
                {formatDuration(s.durationSec)}
                {s.distanceKm !== undefined && (
                  <>
                    {' · '}
                    {formatDistance(s.distanceKm, settings.distanceUnit)}
                    {' · '}
                    {formatPace(s.durationSec, s.distanceKm, settings.distanceUnit)}
                  </>
                )}
                {s.avgHr !== undefined && <> · ♥ {s.avgHr} avg</>}
                {s.heartRateSource === 'bluetooth' && ' 📡'}
                {s.calories !== undefined && <> · {s.calories} kcal</>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
