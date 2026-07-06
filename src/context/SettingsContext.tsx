import { onSnapshot } from 'firebase/firestore'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { userDoc } from '../lib/firestore/collections'
import { updateUserSettings } from '../lib/firestore/userSettings'
import type { UserProfile, UserSettings } from '../types/user'
import { DEFAULT_SETTINGS } from '../types/user'
import { useAuth } from './AuthContext'

interface SettingsContextValue {
  settings: UserSettings
  profile: UserProfile | null
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function applyTheme(theme: UserSettings['theme']) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    return onSnapshot(userDoc(user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null)
    })
  }, [user])

  const settings = profile?.settings ?? DEFAULT_SETTINGS

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return
    await updateUserSettings(user.uid, updates)
  }

  return (
    <SettingsContext.Provider value={{ settings, profile, updateSettings }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
