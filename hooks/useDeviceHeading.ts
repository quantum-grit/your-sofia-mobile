import {useState, useEffect} from 'react'
import {Magnetometer} from 'expo-sensors'

interface UseDeviceHeadingResult {
  /** Compass heading in degrees, 0 = north, clockwise. null before first reading. */
  heading: number | null
  available: boolean
}

const ALPHA = 0.15 // low-pass filter weight (0=frozen, 1=raw)

export function useDeviceHeading(): UseDeviceHeadingResult {
  const [heading, setHeading] = useState<number | null>(null)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    let smoothed: number | null = null
    let mounted = true

    Magnetometer.isAvailableAsync().then((ok) => {
      if (!mounted) return
      if (!ok) {
        setAvailable(false)
        return
      }

      Magnetometer.setUpdateInterval(100)

      const sub = Magnetometer.addListener(({x, y}) => {
        if (!mounted) return
        // Standard compass bearing: 0=N, 90=E, 180=S, 270=W (clockwise)
        let raw = Math.atan2(-x, y) * (180 / Math.PI)
        raw = ((raw % 360) + 360) % 360

        if (smoothed === null) {
          smoothed = raw
        } else {
          // Low-pass filter to reduce jitter, handling the 0/360 wrap-around
          let delta = raw - smoothed
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360
          smoothed = (((smoothed + ALPHA * delta) % 360) + 360) % 360
        }

        setHeading(smoothed)
      })

      return () => sub.remove()
    })

    return () => {
      mounted = false
    }
  }, [])

  return {heading, available}
}
