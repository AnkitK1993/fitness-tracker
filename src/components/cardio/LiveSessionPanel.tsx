import { useEffect, useRef, useState } from 'react'
import { useHeartRateSensor } from '../../hooks/useHeartRateSensor'
import { formatDuration } from '../../lib/units'
import { LiveHeartRateMonitor } from './LiveHeartRateMonitor'

export interface LiveSessionResult {
  durationSec: number
  hrStats: { min: number; max: number; avg: number } | null
}

/**
 * Stopwatch + optional Bluetooth HR capture for a live cardio session.
 * On stop, reports elapsed time and HR min/avg/max to the parent form.
 */
export function LiveSessionPanel({ onStop }: { onStop: (result: LiveSessionResult) => void }) {
  const sensor = useHeartRateSensor()
  const [running, setRunning] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const start = () => {
    sensor.resetSamples()
    startRef.current = Date.now()
    setElapsedSec(0)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      if (startRef.current !== null) setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    const durationSec =
      startRef.current !== null ? Math.round((Date.now() - startRef.current) / 1000) : elapsedSec
    onStop({ durationSec, hrStats: sensor.getStats() })
  }

  return (
    <div className="card live-session">
      <div className="live-session-header">
        <h3>Live session</h3>
        <span className="live-timer">{formatDuration(elapsedSec)}</span>
      </div>
      <LiveHeartRateMonitor sensor={sensor} />
      {!sensor.isSupported && (
        <p className="hint">
          Live heart-rate pairing isn't available in this browser (Chrome/Edge on desktop or Android only).
          Enter heart rate manually below.
        </p>
      )}
      {running ? (
        <button type="button" className="btn btn-danger" onClick={stop}>
          ⏹ Stop &amp; fill form
        </button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={start}>
          ▶ Start session
        </button>
      )}
    </div>
  )
}
