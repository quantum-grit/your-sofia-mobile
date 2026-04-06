import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import {useState, useEffect} from 'react'
import {useRouter} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {Check} from 'lucide-react-native'
import {fetchCityDistricts} from '../../lib/payload'
import type {CityDistrict, LocationFilterDistrict} from '../../types/subscription'

export default function DistrictPickerScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const [districts, setDistricts] = useState<CityDistrict[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<CityDistrict | null>(null)

  useEffect(() => {
    fetchCityDistricts()
      .then(setDistricts)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleConfirm = () => {
    if (!selected) return
    const filter: Omit<LocationFilterDistrict, 'id'> = {
      filterType: 'district',
      district: {id: selected.id, name: selected.name, districtId: selected.districtId},
    }
    // Pass result back to notifications/index via global bridge
    const addFilter = (global as any).__addNotificationFilter
    if (typeof addFilter === 'function') addFilter(filter)
    router.back()
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={districts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({item}) => {
          const isSelected = selected?.id === item.id
          return (
            <TouchableOpacity
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => setSelected(isSelected ? null : item)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.districtId}>{item.districtId}</Text>
                <Text style={styles.districtName}>{item.name}</Text>
              </View>
              {isSelected && <Check size={18} color="#1E40AF" />}
            </TouchableOpacity>
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selected}
        >
          <Text style={styles.confirmBtnText}>{t('notifications.confirmLocation')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {paddingVertical: 8},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  rowSelected: {backgroundColor: '#EFF6FF'},
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  districtId: {
    width: 28,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'right',
  },
  districtName: {fontSize: 15, color: '#111827'},
  separator: {height: 1, backgroundColor: '#F3F4F6', marginLeft: 60},
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
