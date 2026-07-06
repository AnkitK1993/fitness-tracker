import { Navigate, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Checking sign-in…" />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
