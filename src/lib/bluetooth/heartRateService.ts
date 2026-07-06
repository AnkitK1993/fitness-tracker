/**
 * Framework-agnostic Web Bluetooth client for the standard BLE Heart Rate
 * Service (0x180D) / Heart Rate Measurement characteristic (0x2A37).
 *
 * Supported in Chromium browsers (Chrome/Edge desktop, Chrome Android).
 * Not available in Safari/iOS or Firefox — callers must feature-detect via
 * isBluetoothSupported() and fall back to manual entry.
 */

export interface HeartRateConnection {
  deviceName: string | null
  disconnect: () => void
}

export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

/** Heart Rate Measurement flags byte, bit 0: 0 = uint8 BPM, 1 = uint16 LE BPM. */
function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0)
  return flags & 0x1 ? value.getUint16(1, true) : value.getUint8(1)
}

/**
 * Opens the browser device chooser filtered to heart-rate devices, connects,
 * and streams BPM readings to `onReading` until disconnected.
 *
 * Resolves to null if the user dismisses the chooser (not an error).
 * Rejects on real connection failures.
 */
export async function connectHeartRateSensor(
  onReading: (bpm: number) => void,
  onDisconnect: () => void,
): Promise<HeartRateConnection | null> {
  let device: BluetoothDevice
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') return null // user cancelled the chooser
    throw err
  }

  if (!device.gatt) throw new Error('Device does not support GATT')

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService('heart_rate')
  const characteristic = await service.getCharacteristic('heart_rate_measurement')

  const handleValueChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    if (target.value) onReading(parseHeartRate(target.value))
  }

  characteristic.addEventListener('characteristicvaluechanged', handleValueChanged)
  device.addEventListener('gattserverdisconnected', onDisconnect)
  await characteristic.startNotifications()

  return {
    deviceName: device.name ?? null,
    disconnect: () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleValueChanged)
      device.removeEventListener('gattserverdisconnected', onDisconnect)
      if (device.gatt?.connected) device.gatt.disconnect()
    },
  }
}
