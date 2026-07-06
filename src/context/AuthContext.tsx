import type { User } from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/config'
import { createUserProfile, ensureUserProfile } from '../lib/firestore/userSettings'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (displayName: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signUp = async (displayName: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await createUserProfile(cred.user.uid, displayName, email)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider())
    await ensureUserProfile(cred.user.uid, cred.user.displayName ?? 'Athlete', cred.user.email ?? '')
  }

  const signOutUser = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** For use in protected routes only, where user is guaranteed non-null. */
export function useUid(): string {
  const { user } = useAuth()
  if (!user) throw new Error('useUid called outside a protected route')
  return user.uid
}
