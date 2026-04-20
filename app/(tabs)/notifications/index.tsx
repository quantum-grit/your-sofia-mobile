import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import {useState, useEffect, useCallback} from 'react'
import {useRouter} from 'expo-router'
import {useFocusEffect} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import {AlertCircle, MapPin, Plus, Trash2, ChevronRight} from 'lucide-react-native'

import {CATEGORY_DISPLAY_ORDER, getCategoryColor, getCategoryIcon} from '../../../lib/categories'
import {useSubscription} from '../../../hooks/useSubscription'
import {useAuth} from '../../../contexts/AuthContext'
import {registerNotificationFilterListener} from '../../../lib/notificationFilterBridge'
import type {LocationFilter, SubscriptionCategory} from '../../../types/subscription'
import {formatLocationFilter} from '../../../lib/formatLocationFilter'

export default function NotificationsScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const {token: authToken} = useAuth()
  const {subscription, pushTokenString, isLoading, saveSubscription, reload} = useSubscription()

  // Reload on focus so we pick up the push token stored by useNotifications in the home tab
  useFocusEffect(
    useCallback(() => {
      reload()
    }, [reload])
  )

  // Local drafts
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [locationFilters, setLocationFilters] = useState<Omit<LocationFilter, 'id'>[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Populate drafts from loaded subscription
  useEffect(() => {
    if (subscription) {
      const slugs = subscription.categories.map((c: SubscriptionCategory) => c.slug).filter(Boolean)
      setSelectedSlugs(new Set<string>(slugs))
      setLocationFilters(
        subscription.locationFilters.map(({id: _id, ...rest}) => rest) as Omit<
          LocationFilter,
          'id'
        >[]
      )
    }
  }, [subscription])

  const toggleCategory = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedSlugs.size === CATEGORY_DISPLAY_ORDER.length) {
      setSelectedSlugs(new Set())
    } else {
      setSelectedSlugs(new Set(CATEGORY_DISPLAY_ORDER))
    }
  }

  const removeLocationFilter = (index: number) => {
    setLocationFilters((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddLocation = () => {
    Alert.alert(t('notifications.addLocation'), undefined, [
      {
        text: t('notifications.locationTypeDistrict'),
        onPress: () =>
          router.push({
            pathname: '/(tabs)/notifications/district-picker',
            params: {returnTo: '/(tabs)/notifications'},
          } as any),
      },
      {
        text: t('notifications.locationTypePoint'),
        onPress: () =>
          router.push({
            pathname: '/(tabs)/notifications/point-picker',
            params: {returnTo: '/(tabs)/notifications'},
          } as any),
      },
      {
        text: t('notifications.locationTypeArea'),
        onPress: () =>
          router.push({
            pathname: '/(tabs)/notifications/area-picker',
            params: {returnTo: '/(tabs)/notifications'},
          } as any),
      },
      {text: t('common.cancel'), style: 'cancel'},
    ])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveSubscription(Array.from(selectedSlugs), locationFilters, authToken)
      Alert.alert(t('common.success'), t('notifications.saveSuccess'))
    } catch (err) {
      console.error('[NotificationsScreen] save error', err)
      const isNoPushToken =
        err instanceof Error && err.message.includes('No push token registered on this device')
      const errorDetail =
        err instanceof Error && err.message && !isNoPushToken ? err.message : undefined
      Alert.alert(
        t('common.error'),
        isNoPushToken
          ? t('notifications.noPushToken')
          : (errorDetail ?? t('notifications.saveError'))
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Listen for filter passed back from pickers via the notification filter bridge
  const addFilterFromParams = useCallback((filter: Omit<LocationFilter, 'id'>) => {
    setLocationFilters((prev) => [...prev, filter])
  }, [])

  useEffect(() => {
    return registerNotificationFilterListener(addFilterFromParams)
  }, [addFilterFromParams])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    )
  }

  const allSelected = selectedSlugs.size === CATEGORY_DISPLAY_ORDER.length

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* No push token banner */}
        {!pushTokenString && (
          <View style={styles.noPushTokenBanner}>
            <AlertCircle size={18} color="#92400E" />
            <Text style={styles.noPushTokenText}>{t('notifications.noPushToken')}</Text>
          </View>
        )}
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('notifications.categories')}</Text>
            <TouchableOpacity onPress={toggleAll}>
              <Text style={styles.toggleAll}>
                {allSelected ? t('notifications.deselectAll') : t('notifications.selectAll')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>{t('notifications.categoriesSubtitle')}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORY_DISPLAY_ORDER.map((slug) => {
              const Icon = getCategoryIcon(slug)
              const color = getCategoryColor(slug)
              const selected = selectedSlugs.has(slug)
              return (
                <Pressable
                  key={slug}
                  onPress={() => toggleCategory(slug)}
                  style={[
                    styles.categoryChip,
                    selected && {backgroundColor: color, borderColor: color},
                    !selected && {borderColor: color},
                  ]}
                >
                  <Icon size={16} color={selected ? '#ffffff' : color} />
                  <Text
                    style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}
                    numberOfLines={2}
                  >
                    {t(`categories.${slug}`)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Location filters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('notifications.locationFilters')}</Text>
          </View>
          <Text style={styles.sectionSubtitle}>{t('notifications.locationFiltersSubtitle')}</Text>

          {locationFilters.length === 0 ? (
            <Text style={styles.emptyFilters}>{t('notifications.noLocationFilters')}</Text>
          ) : (
            locationFilters.map((filter, index) => (
              <View key={index} style={styles.filterRow}>
                <MapPin size={16} color="#1E40AF" style={styles.filterIcon} />
                <Text style={styles.filterLabel} numberOfLines={1}>
                  {formatLocationFilter(filter as LocationFilter, t)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeLocationFilter(index)}
                  style={styles.removeBtn}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addFilterBtn} onPress={handleAddLocation}>
            <Plus size={18} color="#1E40AF" />
            <Text style={styles.addFilterText}>{t('notifications.addLocation')}</Text>
            <ChevronRight size={16} color="#9CA3AF" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isSaving || !pushTokenString) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !pushTokenString}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>{t('notifications.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scrollContent: {padding: 16, paddingBottom: 24},
  noPushTokenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noPushTokenText: {flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18},
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  sectionSubtitle: {fontSize: 13, color: '#6B7280', marginBottom: 12},
  toggleAll: {fontSize: 13, color: '#1E40AF', fontWeight: '600'},
  categoryGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    maxWidth: '48%',
  },
  categoryChipText: {fontSize: 12, color: '#374151', fontWeight: '500', flexShrink: 1},
  categoryChipTextSelected: {color: '#ffffff'},
  emptyFilters: {fontSize: 13, color: '#9CA3AF', marginBottom: 12, fontStyle: 'italic'},
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterIcon: {marginRight: 8},
  filterLabel: {flex: 1, fontSize: 14, color: '#374151'},
  removeBtn: {padding: 4},
  addFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  addFilterText: {fontSize: 14, color: '#1E40AF', fontWeight: '600'},
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {opacity: 0.6},
  saveButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '700'},
})
