import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useExerciseLibrary } from '../hooks/useExerciseLibrary'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { ExerciseProgressCard, SessionList } from './WorkoutsPage'

/** Dedicated abs/core entry point — same data model as workouts, splitType fixed to 'core'. */
export function CorePage() {
  const { sessions, loading, error } = useWorkoutSessions()
  const { active: exercises } = useExerciseLibrary()

  if (loading) return <LoadingSpinner />
  if (error) return <p className="form-error">Failed to load sessions: {error.message}</p>

  const coreSessions = sessions.filter((s) => s.splitType === 'core')
  const coreExercises = exercises.filter((e) => e.category === 'core')

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔥 Core</h1>
        <Link to="/core/new" className="btn btn-primary">
          + Log core session
        </Link>
      </div>

      <SessionList
        sessions={coreSessions}
        basePath="/core"
        newPath="/core/new"
        emptyTitle="No core sessions yet"
        emptyMessage="Planks, crunches, leg raises — log your first abs workout. Time-based holds are supported."
      />

      <ExerciseProgressCard exercises={coreExercises} />
    </div>
  )
}
