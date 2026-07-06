import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeartRateConnection } from '../lib/bluetooth/heartRateService'
import { connectHeartRateSensor, isBluetoothSupported } from '../lib/bluetooth/heartRateService'

export type SensorStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface HeartRateStats {
  min: number
  max: number
  avg: number
}

export function useHeartRateSensor() {
  const [status, setStatus] = useState<SensorStatus>('idle')
  const [currentBpm, setCurrentBpm] = useState<number | null>(null)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const samplesRef = useRef<number[]>([])
  const connectionRef = useRef<HeartRateConnection | null>(null)

  const connect = useCallback(async () => {
    setError(null)
    setStatus('connecting')
    try {
      const connection = await connectHeartRateSensor(
        (bpm) => {
          samplesRef.current.push(bpm)
          setCurrentBpm(bpm)
        },
        () => setStatus('disconnected'),
      )
      if (!connection) {
        // user dismissed the device chooser
        setStatus('idle')
        return
      }
      connectionRef.current = connection
      setDeviceName(connection.deviceName)
      setStatus('connected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to heart rate sensor')
      setStatus('error')
    }
  }, [])

  const disconnect = useCallback(() => {
    connectionRef.current?.disconnect()
    connectionRef.current = null
    setStatus('disconnected')
  }, [])

  const resetSamples = useCallback(() => {
    samplesRef.current = []
    setCurrentBpm(null)
  }, [])

  const getStats = useCallback((): HeartRateStats | null => {
    const samples = samplesRef.current
    if (samples.length === 0) return null
    let min = samples[0]
    let max = samples[0]
    let sum = 0
    for (const s of samples) {
      if (s < min) min = s
      if (s > max) max = s
      sum += s
    }
    return { min, max, avg: Math.round(sum / samples.length) }
  }, [])

  // tear down the GATT connection if the component unmounts mid-session
  useEffect(() => {
    return () => connectionRef.current?.disconnect()
  }, [])

  return {
    isSupported: isBluetoothSupported(),
    status,
    currentBpm,
    deviceName,
    error,
    connect,
    disconnect,
    resetSamples,
    getStats,
  }
}
