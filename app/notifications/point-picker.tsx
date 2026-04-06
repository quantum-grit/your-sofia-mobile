import {View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView} from 'react-native'
import {useState} from 'react'
import {useRouter} from 'expo-router'
import {useTranslation} from 'react-i18next'
import MapView, {Marker, type Region} from 'react-native-maps'
import type {LocationFilterPoint} from '../../types/subscription'
import {emitNotificationFilter} from '../../lib/notificationFilterBridge'

// Sofia center
const SOFIA_REGION: Region = {
  latitude: 42.6977,
  longitude: 23.3219,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

const RADIUS_OPTIONS_METRES = [500, 1000, 2000, 3000, 5000, 10000]

export default function PointPickerScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const [markerCoord, setMarkerCoord] = useState<{latitude: number; longitude: number} | null>(null)
  const [radius, setRadius] = useState<number>(1000)

  const handleMapPress = (e: any) => {
    const coordinate = e?.nativeEvent?.coordinate
    if (!coordinate) return
    setMarkerCoord(coordinate)
  }

  const handleConfirm = () => {
    if (!markerCoord) return
    const filter: Omit<LocationFilterPoint, 'id'> = {
      filterType: 'point',
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
      radius,
    }
    emitNotificationFilter(filter)
    router.back()
  }

  const formatRadius = (r: number): string =>
    r >= 1000
      ? t('notifications.radiusKm').replace('{{n}}', String(r / 1000))
      : t('notifications.radiusM').replace('{{n}}', String(r))

  return (
    <SafeAreaView style={styles.container}>
      <MapView style={styles.map} initialRegion={SOFIA_REGION} onPress={handleMapPress}>
        {markerCoord && (
          <Marker
            coordinate={markerCoord}
            draggable
            onDragEnd={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        <Text style={styles.hint}>
          {markerCoord
            ? `${markerCoord.latitude.toFixed(5)}, ${markerCoord.longitude.toFixed(5)}`
            : t('notifications.pickPoint')}
        </Text>

        <Text style={styles.radiusLabel}>{t('notifications.locationTypePoint')}</Text>
        <View style={styles.radiusOptions}>
          {RADIUS_OPTIONS_METRES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, radius === r && styles.radiusChipSelected]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextSelected]}>
                {formatRadius(r)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !markerCoord && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!markerCoord}
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
  panel: {maxHeight: 200, backgroundColor: '#ffffff'},
  panelContent: {padding: 16},
  hint: {fontSize: 13, color: '#6B7280', marginBottom: 12, textAlign: 'center'},
  radiusLabel: {fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8},
  radiusOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  radiusChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1E40AF',
    backgroundColor: '#ffffff',
  },
  radiusChipSelected: {backgroundColor: '#1E40AF'},
  radiusChipText: {fontSize: 13, color: '#1E40AF', fontWeight: '600'},
  radiusChipTextSelected: {color: '#ffffff'},
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
