import React, {useState, useEffect} from 'react'
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location'
import {useTranslation} from 'react-i18next'
import {useNews} from '../../../hooks/useNews'
import {ImplementMeGithub} from '../../../components/ImplementMeGithub'

export default function NewsMap() {
  const {t} = useTranslation()
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [locationError, setLocationError] = useState(false)
  const {news, loading} = useNews('all')

  useEffect(() => {
    ;(async () => {
      try {
        const {status} = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          console.warn('Location permission not granted')
          setLocationError(true)
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        setLocation(currentLocation)
      } catch (error) {
        console.error('Error getting location:', error)
        setLocationError(true)
      }
    })()
  }, [])

  // Default to Sofia center if location is not available
  const region = {
    latitude: location?.coords.latitude || 42.6977,
    longitude: location?.coords.longitude || 23.3219,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }

  // Filter news items that have location data
  const newsWithLocation = news.filter((item) => item.location)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>{t('map.loading')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {/* User location marker - only show if location permission was denied */}
        {location && !locationError && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t('common.yourLocation') || 'Your Location'}
            pinColor="#1E40AF"
          />
        )}

        {/* News markers */}
        {newsWithLocation.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.location?.latitude ?? 42.6977,
              longitude: item.location?.longitude ?? 23.3219,
            }}
            title={item.title}
            description={item.description}
          />
        ))}
      </MapView>
      <View style={styles.implementMeContainer}>
        <ImplementMeGithub
          extendedText={t('common.implementMeMessage')}
          issueUrl="https://github.com/sofia-municipality/your-sofia-mobile/issues/3"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  implementMeContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    borderRadius: 8,
  },
})
