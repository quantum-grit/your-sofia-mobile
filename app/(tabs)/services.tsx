import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native'
import {
  Building2,
  FileCheck,
  Heart,
  Car,
  GraduationCap,
  Briefcase,
  Home,
  Trash2,
  MapPin,
  Users,
  Search,
} from 'lucide-react-native'
import {useTranslation} from 'react-i18next'
import {colors, fonts, fontSizes} from '@/styles/tokens'

interface Service {
  id: number
  title: string
  icon: any
  description: string
  status: string
}

interface ServiceCategory {
  id: number
  title: string
  services: Service[]
}

const getServiceCategories = (t: (key: string) => string): ServiceCategory[] => [
  {
    id: 1,
    title: t('permits.title'),
    services: [
      {
        id: 11,
        title: t('permits.buildingPermits.title'),
        icon: Building2,
        description: t('permits.buildingPermits.description'),
        status: t('status.available'),
      },
      {
        id: 12,
        title: t('permits.businessLicense.title'),
        icon: Briefcase,
        description: t('permits.businessLicense.description'),
        status: t('status.available'),
      },
    ],
  },
  {
    id: 2,
    title: t('certificates.title'),
    services: [
      {
        id: 21,
        title: t('certificates.birth.title'),
        icon: FileCheck,
        description: t('certificates.birth.description'),
        status: t('status.available'),
      },
      {
        id: 22,
        title: t('certificates.marriage.title'),
        icon: Users,
        description: t('certificates.marriage.description'),
        status: t('status.available'),
      },
    ],
  },
  {
    id: 3,
    title: t('transportation.title'),
    services: [
      {
        id: 31,
        title: t('transportation.parking.title'),
        icon: Car,
        description: t('transportation.parking.description'),
        status: t('status.available'),
      },
      {
        id: 32,
        title: t('transportation.publicTransport.title'),
        icon: MapPin,
        description: t('transportation.publicTransport.description'),
        status: t('status.available'),
      },
    ],
  },
  {
    id: 4,
    title: t('health.title'),
    services: [
      {
        id: 41,
        title: t('health.registration.title'),
        icon: Heart,
        description: t('health.registration.description'),
        status: t('status.available'),
      },
      {
        id: 42,
        title: t('health.socialBenefits.title'),
        icon: Users,
        description: t('health.socialBenefits.description'),
        status: t('status.available'),
      },
    ],
  },
  {
    id: 5,
    title: t('education.title'),
    services: [
      {
        id: 51,
        title: t('education.enrollment.title'),
        icon: GraduationCap,
        description: t('education.enrollment.description'),
        status: t('status.available'),
      },
    ],
  },
  {
    id: 6,
    title: t('municipal.title'),
    services: [
      {
        id: 61,
        title: t('municipal.propertyReg.title'),
        icon: Home,
        description: t('municipal.propertyReg.description'),
        status: t('status.available'),
      },
      {
        id: 62,
        title: t('municipal.waste.title'),
        icon: Trash2,
        description: t('municipal.waste.description'),
        status: t('status.available'),
      },
    ],
  },
]

export default function ServicesScreen() {
  const {t: t_services} = useTranslation('services')
  const {t} = useTranslation()
  const serviceCategories = getServiceCategories(t_services)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>{t_services('search.placeholder')}</Text>
          </View>
        </View>

        {/* Service Categories */}
        {serviceCategories.map((category: ServiceCategory) => (
          <View key={category.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <View style={styles.servicesList}>
              {category.services.map((service: Service) => {
                const IconComponent = service.icon
                return (
                  <TouchableOpacity key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceCardHeader}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{service.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        ))}

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>{t_services('support.title')}</Text>
          <Text style={styles.supportDescription}>{t_services('support.description')}</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>{t_services('support.button')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: fontSizes.h2,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchPlaceholder: {
    marginLeft: 12,
    color: colors.textMuted,
    fontSize: fontSizes.bodySm,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: fontSizes.caption,
    color: colors.success,
    fontFamily: fonts.medium,
  },
  serviceDescription: {
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  supportSection: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  supportTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    color: colors.surface,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.bodySm,
  },
})
