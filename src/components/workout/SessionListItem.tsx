import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { formatDateShort } from '../../lib/dates'
import { formatWeight } from '../../lib/units'
import type { WorkoutSession } from '../../types/workout'
import { SPLIT_LABELS, sessionVolumeKg } from '../../types/workout'

export function SessionListItem({ session, basePath }: { session: WorkoutSession; basePath: string }) {
  const { settings } = useSettings()
  const volume = sessionVolumeKg(session)
  const names = session.exercises.map((e) => e.exerciseName).join(' · ')

  return (
    <Link to={`${basePath}/${session.id}`} className="list-item">
      <div className="list-item-main">
        <span className={`badge badge-${session.splitType}`}>{SPLIT_LABELS[session.splitType]}</span>
        <span className="list-item-title">{formatDateShort(session.date)}</span>
      </div>
      <div className="list-item-sub">{names || 'No exercises'}</div>
      <div className="list-item-meta">
        {session.exercises.length} exercise{session.exercises.length === 1 ? '' : 's'}
        {volume > 0 && <> · {formatWeight(volume, settings.weightUnit, 0)} volume</>}
      </div>
    </Link>
  )
}
