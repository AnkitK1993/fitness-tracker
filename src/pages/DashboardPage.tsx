import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { WeightTrendChart } from '../components/charts/WeightTrendChart'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useBodyWeightLogs } from '../hooks/useBodyWeightLogs'
import { useCardioSessions } from '../hooks/useCardioSessions'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { daysAgoISO, formatDateShort } from '../lib/dates'
import { formatDistance, formatDuration, formatWeight, kgToDisplay, round } from '../lib/units'
import { cardioActivityLabel } from '../types/cardio'
import { SPLIT_LABELS, sessionVolumeKg } from '../types/workout'

export function DashboardPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const weight = useBodyWeightLogs()
  const workouts = useWorkoutSessions()
  const cardio = useCardioSessions()

  const loading = weight.loading || workouts.loading || cardio.loading

  const weekAgo = daysAgoISO(7)

  const weekStats = useMemo(() => {
    const weekWorkouts = workouts.sessions.filter((s) => s.date >= weekAgo)
    const weekCardio = cardio.sessions.filter((s) => s.date >= weekAgo)
    return {
      workoutCount: weekWorkouts.length,
      volumeKg: weekWorkouts.reduce((sum, s) => sum + sessionVolumeKg(s), 0),
      cardioCount: weekCardio.length,
      cardioMinutes: Math.round(weekCardio.reduce((sum, s) => sum + s.durationSec, 0) / 60),
      cardioDistanceKm: weekCardio.reduce((sum, s) => sum + (s.distanceKm ?? 0), 0),
    }
  }, [workouts.sessions, cardio.sessions, weekAgo])

  const recentActivity = useMemo(() => {
    const items = [
      ...workouts.sessions.map((s) => ({
        key: `w-${s.id}`,
        date: s.date,
        to: `/workouts/${s.id}`,
        badgeClass: `badge badge-${s.splitType}`,
        label: SPLIT_LABELS[s.splitType],
        detail: `${s.exercises.length} exercise${s.exercises.length === 1 ? '' : 's'}`,
      })),
      ...cardio.sessions.map((s) => ({
        key: `c-${s.id}`,
        date: s.date,
        to: `/cardio/${s.id}`,
        badgeClass: 'badge badge-cardio',
        label: cardioActivityLabel(s),
        detail: formatDuration(s.durationSec),
      })),
    ]
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  }, [workouts.sessions, cardio.sessions])

  if (loading) return <LoadingSpinner />

  const latestWeight = weight.logs[0]
  const prevWeight = weight.logs.find((l) => l.date <= daysAgoISO(7) && l.id !== latestWeight?.id)
  const weightDelta =
    latestWeight && prevWeight
      ? round(kgToDisplay(latestWeight.weightKg - prevWeight.weightKg, settings.weightUnit), 1)
      : null

  const firstName = (user?.displayName ?? '').split(' ')[0]

  return (
    <div className="page">
      <div className="page-header">
        <h1>{firstName ? `Hi, ${firstName}!` : 'Dashboard'}</h1>
      </div>

      <div className="stat-row">
        <div className="stat-tile card">
          <span className="stat-label">Weight</span>
          <span className="stat-value">
            {latestWeight ? formatWeight(latestWeight.weightKg, settings.weightUnit) : '—'}
          </span>
          {weightDelta !== null && (
            <span className="stat-sub">
              {weightDelta > 0 ? '▲' : weightDelta < 0 ? '▼' : '—'} {Math.abs(weightDelta)} {settings.weightUnit} vs
              last week
            </span>
          )}
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Workouts this week</span>
          <span className="stat-value">{weekStats.workoutCount}</span>
          {weekStats.volumeKg > 0 && (
            <span className="stat-sub">{formatWeight(weekStats.volumeKg, settings.weightUnit, 0)} volume</span>
          )}
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Cardio this week</span>
          <span className="stat-value">{weekStats.cardioCount}</span>
          {weekStats.cardioMinutes > 0 && (
            <span className="stat-sub">
              {weekStats.cardioMinutes} min
              {weekStats.cardioDistanceKm > 0 &&
                ` · ${formatDistance(weekStats.cardioDistanceKm, settings.distanceUnit, 1)}`}
            </span>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/workouts/new?split=push" className="btn">
          + Push
        </Link>
        <Link to="/workouts/new?split=pull" className="btn">
          + Pull
        </Link>
        <Link to="/workouts/new?split=legs" className="btn">
          + Legs
        </Link>
        <Link to="/core/new" className="btn">
          + Core
        </Link>
        <Link to="/cardio/new" className="btn">
          + Cardio
        </Link>
        <Link to="/weight" className="btn">
          + Weigh-in
        </Link>
      </div>

      {weight.logs.length > 1 && (
        <div className="card chart-card">
          <div className="chart-card-header">
            <h2>Weight trend</h2>
            <Link to="/weight" className="muted">
              View all →
            </Link>
          </div>
          <WeightTrendChart
            logs={weight.logs.slice(0, 30)}
            weightUnit={settings.weightUnit}
            goalWeightKg={settings.goalWeightKg}
            height={200}
          />
        </div>
      )}

      <div className="card">
        <h2>Recent activity</h2>
        {recentActivity.length === 0 ? (
          <p className="hint">Nothing logged yet — use the quick actions above to get started.</p>
        ) : (
          <div className="list">
            {recentActivity.map((item) => (
              <Link key={item.key} to={item.to} className="list-item">
                <div className="list-item-main">
                  <span className={item.badgeClass}>{item.label}</span>
                  <span className="list-item-title">{formatDateShort(item.date)}</span>
                  <span className="muted">{item.detail}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
