import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// When unconfigured the app renders a setup screen and never touches auth/db,
// but the SDK still needs syntactically valid values to initialize.
const app = initializeApp(
  isFirebaseConfigured
    ? firebaseConfig
    : { apiKey: 'unconfigured', authDomain: 'unconfigured', projectId: 'unconfigured', appId: 'unconfigured' },
)

export const auth = getAuth(app)
export const db = getFirestore(app)
