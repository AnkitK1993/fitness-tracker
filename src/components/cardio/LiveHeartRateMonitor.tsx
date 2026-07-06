import type { useHeartRateSensor } from '../../hooks/useHeartRateSensor'

type Sensor = ReturnType<typeof useHeartRateSensor>

/**
 * Live BPM readout + pair/disconnect controls. The sensor hook lives in the
 * parent page so it can pull min/avg/max stats when the session stops.
 * Renders nothing when Web Bluetooth is unavailable — the parent shows the
 * manual-entry note instead.
 */
export function LiveHeartRateMonitor({ sensor }: { sensor: Sensor }) {
  if (!sensor.isSupported) return null

  return (
    <div className="hr-monitor">
      {sensor.status === 'connected' ? (
        <>
          <div className="hr-live">
            <span className="hr-bpm">{sensor.currentBpm ?? '—'}</span>
            <span className="hr-unit">bpm</span>
            <span className="hr-pulse" aria-hidden>
              ❤️
            </span>
          </div>
          <div className="hr-device">
            {sensor.deviceName ?? 'Heart rate sensor'}
            <button type="button" className="btn btn-ghost" onClick={sensor.disconnect}>
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="btn"
          disabled={sensor.status === 'connecting'}
          onClick={() => void sensor.connect()}
        >
          {sensor.status === 'connecting' ? 'Connecting…' : '📡 Pair heart rate monitor'}
        </button>
      )}
      {sensor.status === 'disconnected' && <p className="hint">Sensor disconnected.</p>}
      {sensor.error && <p className="form-error">{sensor.error}</p>}
    </div>
  )
}
