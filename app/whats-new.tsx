import {useCallback} from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import {useRouter} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {Newspaper} from 'lucide-react-native'
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import {markWhatsNewSeen, getCurrentAppVersion} from '@/lib/whatsNew'
import {useWhatsNew} from '@/hooks/useWhatsNew'

export default function WhatsNewScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const version = getCurrentAppVersion()
  const {items, loading} = useWhatsNew()
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  })

  const handleContinue = useCallback(async () => {
    await markWhatsNewSeen()
    router.replace('/(tabs)/home')
  }, [router])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.overlay}>
      {/* Backdrop — tap to dismiss */}
      <TouchableOpacity style={styles.backdrop} onPress={handleContinue} activeOpacity={1} />

      {/* Bottom sheet — ~2/3 of screen */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo + wordmark */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/sofia-gerb.png')}
              style={styles.logo}
              accessibilityLabel="Твоята София"
            />
            <Text style={styles.wordmark}>Твоята София</Text>
            <Text style={styles.versionTag}>
              {t('whatsNew.version')} {version}
            </Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>{t('whatsNew.title')}</Text>

          {/* News items from API */}
          {loading ? (
            <ActivityIndicator color="#2F54C5" style={styles.loader} />
          ) : (
            <View style={styles.features}>
              {items.map((item) => (
                <View key={item.id} style={styles.featureRow}>
                  <Newspaper size={20} color="#2F54C5" style={styles.featureIcon} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.featureDescription}>{item.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* CTA — outside ScrollView so it sticks to bottom of sheet */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('whatsNew.continue')}
          >
            <Text style={styles.continueText}>{t('whatsNew.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '67%',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  wordmark: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    letterSpacing: 0.2,
  },
  versionTag: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 28,
  },
  features: {
    gap: 20,
  },
  loader: {
    marginTop: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#2F54C5',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
})
