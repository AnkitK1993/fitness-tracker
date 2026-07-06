import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GoogleSignInButton } from './GoogleSignInButton'

export function SignupPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signUp(displayName.trim(), email, password)
      navigate('/', { replace: true })
    } catch (err) {
      const code = (err as { code?: string }).code
      setError(
        code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : code === 'auth/weak-password'
            ? 'Password must be at least 6 characters.'
            : 'Sign-up failed. Please try again.',
      )
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>💪 Fitness Tracker</h1>
        <h2>Create account</h2>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <label className="form-field">
            <span>Name</span>
            <input type="text" required autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <GoogleSignInButton onError={setError} />
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
