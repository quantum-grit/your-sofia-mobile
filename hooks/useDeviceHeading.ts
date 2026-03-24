import {useState, useEffect} from 'react'
import * as Location from 'expo-location'

interface UseDeviceHeadingResult {
  /** Compass heading in degrees, 0 = north, clockwise. null before first reading. */
  heading: number | null
  available: boolean
}

export function useDeviceHeading(): UseDeviceHeadingResult {
  const [heading, setHeading] = useState<number | null>(null)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null
    let mounted = true

    Location.watchHeadingAsync((data) => {
      if (!mounted) return
      // trueHeading is GPS-corrected; falls back to magHeading when unavailable (< 0)
      const h = data.trueHeading >= 0 ? data.trueHeading : data.magHeading
      if (h >= 0) setHeading(h)
    })
      .then((subscription) => {
        if (!mounted) {
          subscription.remove()
          return
        }
        sub = subscription
      })
      .catch(() => {
        if (mounted) setAvailable(false)
      })

    return () => {
      mounted = false
      sub?.remove()
    }
  }, [])

  return {heading, available}
}
