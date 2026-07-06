import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { isFirebaseConfigured } from './firebase/config'
import { SetupPage } from './pages/SetupPage'
import { router } from './router'

export function App() {
  if (!isFirebaseConfigured) return <SetupPage />

  return (
    <AuthProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  )
}
