import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { CardioPage } from './pages/CardioPage'
import { CardioSessionFormPage } from './pages/CardioSessionFormPage'
import { CorePage } from './pages/CorePage'
import { DashboardPage } from './pages/DashboardPage'
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage'
import { SettingsPage } from './pages/SettingsPage'
import { WeightPage } from './pages/WeightPage'
import { WorkoutSessionFormPage } from './pages/WorkoutSessionFormPage'
import { WorkoutsPage } from './pages/WorkoutsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/weight', element: <WeightPage /> },
          { path: '/workouts', element: <WorkoutsPage /> },
          { path: '/workouts/new', element: <WorkoutSessionFormPage /> },
          { path: '/workouts/:sessionId', element: <WorkoutSessionFormPage /> },
          { path: '/core', element: <CorePage /> },
          { path: '/core/new', element: <WorkoutSessionFormPage basePath="/core" lockedSplit="core" /> },
          { path: '/core/:sessionId', element: <WorkoutSessionFormPage basePath="/core" /> },
          { path: '/cardio', element: <CardioPage /> },
          { path: '/cardio/new', element: <CardioSessionFormPage /> },
          { path: '/cardio/:sessionId', element: <CardioSessionFormPage /> },
          { path: '/exercises', element: <ExerciseLibraryPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
