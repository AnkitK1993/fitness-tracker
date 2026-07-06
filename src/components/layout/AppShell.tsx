import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/weight', label: 'Weight', icon: '⚖️' },
  { to: '/workouts', label: 'Workouts', icon: '🏋️' },
  { to: '/core', label: 'Core', icon: '🔥' },
  { to: '/cardio', label: 'Cardio', icon: '🏃' },
  { to: '/exercises', label: 'Exercises', icon: '📚' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export function AppShell() {
  const { user, signOutUser } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-title">💪 Fitness Tracker</span>
          <div className="app-header-user">
            <span className="user-name">{user?.displayName ?? user?.email}</span>
            <button type="button" className="btn btn-ghost" onClick={() => void signOutUser()}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <nav className="app-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="nav-icon" aria-hidden>
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
