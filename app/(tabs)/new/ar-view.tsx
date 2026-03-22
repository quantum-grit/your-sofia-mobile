import React, {useState, useEffect, useRef, useCallback} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import {CameraView, useCameraPermissions} from 'expo-camera'
import * as Location from 'expo-location'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'expo-router'
import {X} from 'lucide-react-native'
import {WasteContainerCard} from '../../../components/WasteContainerCard'
import {loadNearbyContainers} from '../../../lib/containerUtils'
import {getDistanceFromLatLonInMeters} from '../../../lib/mapUtils'
import {useDeviceHeading} from '../../../hooks/useDeviceHeading'
import {type WasteContainer} from '../../../types/wasteContainer'

const HORIZONTAL_FOV = 60 // degrees — approximate phone camera horizontal FOV
const AR_RADIUS_METERS = 150
const RELOAD_DISTANCE_METERS = 50

// ─── TESTING: hardcoded overlays so the styling is visible without GPS/compass ───
const TEST_OVERLAYS: ProjectedContainer[] = [
  {
    distance: 38,
    screenX: 0, // filled in at render time
    screenY: 0,
    container: {
      id: 'test-1',
      publicNumber: 'RSR-00142',
      location: [23.32, 42.7],
      latitude: 42.7,
      longitude: 23.32,
      capacityVolume: 1.1,
      capacitySize: 'standard',
      wasteType: 'general',
      status: 'active',
      lastCleaned: '2026-03-20 08:00:00+00',
      serviceInterval: '1',
      servicedBy: 'ДКС',
      createdAt: '',
      updatedAt: '',
    },
  },
  {
    distance: 95,
    screenX: 0,
    screenY: 0,
    container: {
      id: 'test-2',
      publicNumber: 'RSR-00871',
      location: [23.32, 42.7],
      latitude: 42.7,
      longitude: 23.32,
      capacityVolume: 1.1,
      capacitySize: 'standard',
      wasteType: 'recyclables',
      status: 'full',
      state: ['full'],
      lastCleaned: '2026-03-18 14:30:00+00',
      serviceInterval: '3',
      createdAt: '',
      updatedAt: '',
    },
  },
  {
    distance: 142,
    screenX: 0,
    screenY: 0,
    container: {
      id: 'test-3',
      publicNumber: 'RSR-01055',
      location: [23.32, 42.7],
      latitude: 42.7,
      longitude: 23.32,
      capacityVolume: 0.24,
      capacitySize: 'small',
      wasteType: 'glass',
      status: 'active',
      state: ['damaged'],
      lastCleaned: undefined,
      serviceInterval: '2',
      createdAt: '',
      updatedAt: '',
    },
  },
]
// ─────────────────────────────────────────────────────────────────────────────

// Normalise a PostgreSQL timestamp to valid ISO 8601 so new Date() parses it reliably.
function normaliseTimestamp(ts: string): string {
  return ts.replace(' ', 'T').concat(':00')
}

function getRelativeTimeLabel(lastCleaned: string | undefined, t: (k: string) => string): string {
  if (!lastCleaned) return t('arView.unknown')
  const normalized = normaliseTimestamp(lastCleaned)
  const hours = (Date.now() - new Date(normalized).getTime()) / 3_600_000
  if (isNaN(hours)) return t('arView.unknown')
  if (hours < 1) return t('arView.lessThanHour')
  if (hours < 24) {
    const h = Math.floor(hours)
    return `${h} ${h === 1 ? t('arView.hour') : t('arView.hours')}`
  }
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? t('arView.day') : t('arView.days')}`
}

/** Returns time until next expected cleaning, in hours, based on lastCleaned + serviceInterval (days). */
function getExpectedCleanLabel(
  lastCleaned: string | undefined,
  serviceInterval: string | undefined,
  t: (k: string) => string
): string {
  if (!lastCleaned || !serviceInterval) return t('arView.unknown')
  const intervalDays = parseFloat(serviceInterval)
  if (isNaN(intervalDays) || intervalDays <= 0) return t('arView.unknown')
  const normalized = normaliseTimestamp(lastCleaned)
  let nextMs = new Date(normalized).getTime() + intervalDays * 24 * 3_600_000
  if (isNaN(nextMs)) return t('arView.unknown')

  let diffH = Math.round((nextMs - Date.now()) / 3_600_000)
  while (diffH < 0) {
    // If overdue, keep adding intervals until we get to the next expected cleaning in the future
    nextMs += intervalDays * 24 * 3_600_000
    if (isNaN(nextMs)) return t('arView.unknown')
    diffH = Math.round((nextMs - Date.now()) / 3_600_000)
  }

  return diffH < 48
    ? `${diffH} ${t('arView.hours')}`
    : `${Math.floor(diffH / 24)} ${t('arView.days')}`
}

function getPinColor(container: WasteContainer): string {
  if (container.state?.includes('full') || container.status === 'full') return '#EF4444'
  if (container.state?.includes('damaged') || container.state?.includes('bagged')) return '#374151'
  if (container.state && container.state.length > 0) return '#F97316'
  return '#10B981'
}

/** Haversine bearing from point A to point B, in degrees (0=N, clockwise). */
function bearingTo(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLon = toRad(toLon - fromLon)
  const lat1 = toRad(fromLat)
  const lat2 = toRad(toLat)
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

interface ProjectedContainer {
  container: WasteContainer
  distance: number
  screenX: number
  screenY: number
}

interface ContainerAROverlayProps {
  container: WasteContainer
  distance: number
  onPress: () => void
}

function ContainerAROverlay({container, distance, onPress}: ContainerAROverlayProps) {
  const {t} = useTranslation()
  const color = getPinColor(container)
  const distanceLabel = ` ${Math.round(distance)}`
  const cleanedLabel = getRelativeTimeLabel(container.lastCleaned, t)

  return (
    <TouchableOpacity style={styles.overlay} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.overlayDot, {backgroundColor: color}]} />
      <View style={styles.overlayBody}>
        <Text style={styles.overlayTitle} numberOfLines={1}>
          {container.publicNumber}
        </Text>
        <Text style={styles.overlayRow} numberOfLines={1}>
          {t('arView.cleaning')}:
        </Text>
        <Text style={styles.overlayRow} numberOfLines={1}>
          {t('arView.lastCleaned')}: {cleanedLabel}
        </Text>
        {container.serviceInterval || container.lastCleaned ? (
          <Text style={styles.overlayRow} numberOfLines={1}>
            {t('arView.expectedCleaning')}:{' '}
            {getExpectedCleanLabel(container.lastCleaned, container.serviceInterval, t)}
          </Text>
        ) : null}
        {container.servicedBy ? (
          <Text style={styles.overlayRow} numberOfLines={1}>
            {t('arView.servicedBy')}: {container.servicedBy}
          </Text>
        ) : null}
        <Text style={[styles.overlayDistance, {color}]}>
          {t('arView.distance')}: {distanceLabel}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default function ArView() {
  const {t} = useTranslation()
  const router = useRouter()
  const {width: screenWidth, height: screenHeight} = useWindowDimensions()
  const [permission, requestPermission] = useCameraPermissions()
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(
    null
  )
  const [containers, setContainers] = useState<(WasteContainer & {distance: number})[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState<WasteContainer | null>(null)
  const [showCamera, setShowCamera] = useState(true)
  const {heading, available: compassAvailable} = useDeviceHeading()
  const lastLoadLocationRef = useRef<{latitude: number; longitude: number} | null>(null)
  const watchRef = useRef<Location.LocationSubscription | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      setShowCamera(false)
      if (watchRef.current) {
        watchRef.current.remove()
        watchRef.current = null
      }
    }
  }, [])

  const loadContainers = useCallback(async (loc: {latitude: number; longitude: number}) => {
    if (!isMountedRef.current) return
    setLoading(true)
    try {
      const nearby = await loadNearbyContainers(loc, AR_RADIUS_METERS, {limit: 20})
      if (isMountedRef.current) {
        setContainers(nearby)
        lastLoadLocationRef.current = loc
      }
    } catch {
      // silently ignore; containers stay as-is
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }, [])

  // Start GPS watch
  useEffect(() => {
    ;(async () => {
      const {status} = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted' || !isMountedRef.current) return

      try {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (!isMountedRef.current) return
        const loc = {latitude: initial.coords.latitude, longitude: initial.coords.longitude}
        setUserLocation(loc)
        loadContainers(loc)
      } catch {
        // ignore
      }

      watchRef.current = await Location.watchPositionAsync(
        {accuracy: Location.Accuracy.BestForNavigation, timeInterval: 3000, distanceInterval: 10},
        (pos) => {
          if (!isMountedRef.current) return
          const loc = {latitude: pos.coords.latitude, longitude: pos.coords.longitude}
          setUserLocation(loc)

          if (!lastLoadLocationRef.current) {
            loadContainers(loc)
            return
          }
          const moved = getDistanceFromLatLonInMeters(
            lastLoadLocationRef.current.latitude,
            lastLoadLocationRef.current.longitude,
            loc.latitude,
            loc.longitude
          )
          if (moved >= RELOAD_DISTANCE_METERS) {
            loadContainers(loc)
          }
        }
      )
    })()
  }, [loadContainers])

  // Project containers onto screen using bearing vs. compass heading
  const projected: ProjectedContainer[] = React.useMemo(() => {
    // ── TEST MODE: when there's no real data yet, show hardcoded cards ──
    if (!userLocation || heading === null) {
      const spacing = screenWidth / (TEST_OVERLAYS.length + 1)
      const testMapped = TEST_OVERLAYS.map((o, i) => ({
        ...o,
        screenX: spacing * (i + 1),
        screenY: screenHeight * 0.25 + i * 20,
      }))
      // Most centred overlay renders last → on top
      testMapped.sort(
        (a, b) => Math.abs(b.screenX - screenWidth / 2) - Math.abs(a.screenX - screenWidth / 2)
      )
      return testMapped
    }
    // ────────────────────────────────────────────────────────────────────

    const halfFov = HORIZONTAL_FOV / 2
    const results: ProjectedContainer[] = []

    containers.forEach((c) => {
      const bearing = bearingTo(
        userLocation.latitude,
        userLocation.longitude,
        c.latitude,
        c.longitude
      )
      let angularDiff = ((bearing - heading + 540) % 360) - 180 // -180..+180

      if (Math.abs(angularDiff) >= halfFov) return // not in view

      const screenX = screenWidth / 2 + (angularDiff / halfFov) * (screenWidth / 2)

      // Closer containers sit a bit lower in the frame
      const baseY = screenHeight * 0.3
      const depthOffset = Math.min(c.distance / 4, 100)
      const screenY = baseY + depthOffset

      results.push({container: c, distance: c.distance, screenX, screenY})
    })

    // Sort by angular offset from centre: most off-centre first, most centred last → on top
    results.sort(
      (a, b) => Math.abs(b.screenX - screenWidth / 2) - Math.abs(a.screenX - screenWidth / 2)
    )

    // Stagger overlapping cards vertically (±60 px threshold)
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < i; j++) {
        if (Math.abs(results[i].screenX - results[j].screenX) < 120) {
          results[i] = {...results[i], screenY: results[j].screenY + 110}
        }
      }
    }

    return results
  }, [userLocation, heading, containers, screenWidth, screenHeight])

  const handleClose = useCallback(() => {
    setShowCamera(false)
    setTimeout(() => router.back(), 80)
  }, [router])

  // — Permission gate —
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1E40AF" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permTitle}>{t('map.permissions.title')}</Text>
        <Text style={styles.permMessage}>{t('map.permissions.message')}</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>{t('map.permissions.button')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Full-screen camera */}
      {showCamera ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, {backgroundColor: '#000'}]} />
      )}

      {/* AR overlay cards */}
      {projected.map(({container, distance, screenX, screenY}) => (
        <View
          key={container.id}
          style={[
            styles.overlayWrapper,
            {
              left: screenX - 110, // centre the 220-wide card on screenX
              top: screenY,
            },
          ]}
          pointerEvents="box-none"
        >
          <ContainerAROverlay
            container={container}
            distance={distance}
            onPress={() => setSelectedContainer(container)}
          />
        </View>
      ))}

      {/* No compass warning */}
      {!compassAvailable && (
        <View style={styles.compassWarning}>
          <Text style={styles.compassWarningText}>{t('arView.noCompass')}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <X size={22} color="#fff" />
      </TouchableOpacity>

      {/* Container detail modal */}
      <Modal
        visible={selectedContainer !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedContainer(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedContainer(null)}
        >
          <View style={styles.modalContent}>
            {selectedContainer && (
              <WasteContainerCard
                container={selectedContainer}
                onClose={() => setSelectedContainer(null)}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  permTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  permButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlayWrapper: {
    position: 'absolute',
    width: 220,
  },
  overlay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  overlayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  overlayBody: {
    flex: 1,
  },
  overlayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  overlayRow: {
    fontSize: 11,
    color: '#D1D5DB',
    marginBottom: 1,
  },
  overlayDistance: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  compassWarning: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(185,28,28,0.85)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  compassWarningText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingBadge: {
    position: 'absolute',
    top: 16,
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 16,
  },
})
