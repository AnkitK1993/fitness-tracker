import { useNavigate, useParams } from 'react-router-dom'
import { CardioSessionForm } from '../components/cardio/CardioSessionForm'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useCardioSessions } from '../hooks/useCardioSessions'

export function CardioSessionFormPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { sessions, loading, add, update, remove } = useCardioSessions()

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined

  if (sessionId && loading) return <LoadingSpinner />
  if (sessionId && !existing) return <p className="form-error">Session not found.</p>

  const done = () => navigate('/cardio')

  return (
    <div className="page">
      <div className="page-header">
        <h1>{existing ? 'Edit cardio' : 'Log cardio'}</h1>
      </div>
      <CardioSessionForm
        key={existing?.id ?? 'new'}
        initial={existing}
        showLivePanel={!existing}
        onSave={(input) => (existing ? update(existing.id, input) : add(input).then(() => undefined))}
        onDelete={existing ? () => remove(existing.id) : undefined}
        onDone={done}
      />
    </div>
  )
}
