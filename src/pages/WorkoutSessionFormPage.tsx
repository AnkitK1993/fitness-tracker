import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SessionForm } from '../components/workout/SessionForm'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import type { SplitType } from '../types/workout'
import { SPLIT_TYPES } from '../types/workout'

interface WorkoutSessionFormPageProps {
  basePath?: string // '/workouts' or '/core'
  lockedSplit?: SplitType
}

export function WorkoutSessionFormPage({ basePath = '/workouts', lockedSplit }: WorkoutSessionFormPageProps) {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const { sessions, loading, add, update, remove } = useWorkoutSessions()

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined

  if (sessionId && loading) return <LoadingSpinner />
  if (sessionId && !existing) return <p className="form-error">Session not found.</p>

  const splitParam = searchParams.get('split')
  const presetSplit =
    lockedSplit ?? (SPLIT_TYPES.includes(splitParam as SplitType) ? (splitParam as SplitType) : undefined)

  const done = () => navigate(basePath)

  return (
    <div className="page">
      <div className="page-header">
        <h1>{existing ? 'Edit session' : 'Log session'}</h1>
      </div>
      <SessionForm
        key={existing?.id ?? 'new'}
        initial={existing}
        lockedSplit={lockedSplit ?? (existing ? undefined : presetSplit)}
        onSave={(input) => (existing ? update(existing.id, input) : add(input).then(() => undefined))}
        onDelete={existing ? () => remove(existing.id) : undefined}
        onDone={done}
      />
    </div>
  )
}
