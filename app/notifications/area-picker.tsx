import {View, Text, TouchableOpacity, StyleSheet, SafeAreaView} from 'react-native'
import {useState} from 'react'
import {useRouter} from 'expo-router'
import {useTranslation} from 'react-i18next'
import MapView, {Marker, Polygon, type Region} from 'react-native-maps'
import type {LocationFilterArea} from '../../types/subscription'

const SOFIA_REGION: Region = {
  latitude: 42.6977,
  longitude: 23.3219,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

interface LngLat {
  latitude: number
  longitude: number
}

export default function AreaPickerScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const [vertices, setVertices] = useState<LngLat[]>([])
  const [closed, setClosed] = useState(false)

  const handleMapPress = (e: any) => {
    if (closed) return
    const coordinate = e?.nativeEvent?.coordinate
    if (!coordinate) return
    setVertices((prev) => [...prev, coordinate])
  }

  const handleUndo = () => {
    if (closed) {
      setClosed(false)
    } else {
      setVertices((prev) => prev.slice(0, -1))
    }
  }

  const handleClose = () => {
    if (vertices.length >= 3) setClosed(true)
  }

  const handleConfirm = () => {
    if (vertices.length < 3) return

    const ring = [...vertices.map((v) => [v.longitude, v.latitude] as [number, number])]
    // Close the ring
    ring.push(ring[0])

    const filter: Omit<LocationFilterArea, 'id'> = {
      filterType: 'area',
      polygon: {type: 'Polygon', coordinates: [ring]},
    }

    const addFilter = (global as any).__addNotificationFilter
    if (typeof addFilter === 'function') addFilter(filter)
    router.back()
  }

  const canConfirm = vertices.length >= 3

  return (
    <SafeAreaView style={styles.container}>
      <MapView style={styles.map} initialRegion={SOFIA_REGION} onPress={handleMapPress}>
        {vertices.map((v, i) => (
          <Marker key={i} coordinate={v} pinColor="#1E40AF" />
        ))}
        {vertices.length >= 3 && (
          <Polygon
            coordinates={vertices}
            fillColor="rgba(30, 64, 175, 0.15)"
            strokeColor="#1E40AF"
            strokeWidth={2}
          />
        )}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.hint}>
          {vertices.length === 0
            ? t('notifications.drawArea')
            : `${vertices.length} ${vertices.length === 1 ? 'точка' : 'точки'}`}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.undoBtn,
              vertices.length === 0 && styles.actionBtnDisabled,
            ]}
            onPress={handleUndo}
            disabled={vertices.length === 0}
          >
            <Text style={styles.actionBtnText}>{t('notifications.undoPoint')}</Text>
          </TouchableOpacity>
          {!closed && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.closeBtn,
                vertices.length < 3 && styles.actionBtnDisabled,
              ]}
              onPress={handleClose}
              disabled={vertices.length < 3}
            >
              <Text style={[styles.actionBtnText, {color: '#1E40AF'}]}>
                {t('notifications.closePolygon')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text style={styles.confirmBtnText}>{t('notifications.confirmLocation')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  panel: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  hint: {fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 12},
  actions: {flexDirection: 'row', gap: 8},
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  actionBtnDisabled: {opacity: 0.4},
  undoBtn: {borderColor: '#EF4444'},
  closeBtn: {borderColor: '#1E40AF'},
  actionBtnText: {fontSize: 13, fontWeight: '600', color: '#EF4444'},
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnDisabled: {opacity: 0.4},
  confirmBtnText: {color: '#ffffff', fontSize: 16, fontWeight: '700'},
})
