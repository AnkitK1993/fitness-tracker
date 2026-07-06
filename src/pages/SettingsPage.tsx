import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { isBluetoothSupported } from '../lib/bluetooth/heartRateService'
import type { DistanceUnit, Theme, WeightUnit } from '../types/user'

export function SettingsPage() {
  const { user, signOutUser } = useAuth()
  const { settings, updateSettings } = useSettings()

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="card">
        <h2>Units</h2>
        <label className="form-field">
          <span>Weight</span>
          <select
            value={settings.weightUnit}
            onChange={(e) => void updateSettings({ weightUnit: e.target.value as WeightUnit })}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
          </select>
        </label>
        <label className="form-field">
          <span>Distance</span>
          <select
            value={settings.distanceUnit}
            onChange={(e) => void updateSettings({ distanceUnit: e.target.value as DistanceUnit })}
          >
            <option value="km">Kilometres (km)</option>
            <option value="mi">Miles (mi)</option>
          </select>
        </label>
      </div>

      <div className="card">
        <h2>Appearance</h2>
        <label className="form-field">
          <span>Theme</span>
          <select value={settings.theme} onChange={(e) => void updateSettings({ theme: e.target.value as Theme })}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <div className="card">
        <h2>Devices</h2>
        <p className="hint">
          {isBluetoothSupported()
            ? '✅ This browser supports Web Bluetooth. Pair a heart-rate monitor from the cardio live session screen.'
            : 'ℹ️ This browser does not support Web Bluetooth (Chrome/Edge on desktop or Android only). Heart rate can still be entered manually on cardio sessions.'}
        </p>
      </div>

      <div className="card">
        <h2>Account</h2>
        <p>
          {user?.displayName} <span className="muted">({user?.email})</span>
        </p>
        <button type="button" className="btn btn-danger" onClick={() => void signOutUser()}>
          Sign out
        </button>
      </div>
    </div>
  )
}
