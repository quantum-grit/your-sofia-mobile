import {useEffect} from 'react'
import {Stack, useRouter} from 'expo-router'
import {StatusBar} from 'expo-status-bar'
import {Image, TouchableOpacity, View} from 'react-native'
import {User} from 'lucide-react-native'
import {useFrameworkReady} from '@/hooks/useFrameworkReady'
import {useTranslation} from 'react-i18next'
import {initializeReporterId} from '@/lib/deviceId'
import {EnvironmentProvider} from '@/contexts/EnvironmentContext'
import {AuthProvider} from '@/contexts/AuthContext'
import {NotificationsProvider} from '@/contexts/NotificationsContext'
import {AppErrorBoundary} from '@/components/AppErrorBoundary'
import {useFonts} from 'expo-font'
import {
  SofiaSans_400Regular,
  SofiaSans_500Medium,
  SofiaSans_600SemiBold,
  SofiaSans_700Bold,
  SofiaSans_800ExtraBold,
} from '@expo-google-fonts/sofia-sans'
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono'
import {colors} from '@/styles/tokens'
import '../i18n'

export default function RootLayout() {
  useFrameworkReady()

  const [fontsLoaded] = useFonts({
    SofiaSans_400Regular,
    SofiaSans_500Medium,
    SofiaSans_600SemiBold,
    SofiaSans_700Bold,
    SofiaSans_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  })

  if (!fontsLoaded) {
    return <View style={{flex: 1, backgroundColor: colors.bg}} />
  }

  return <AppShell />
}

function AppShell() {
  const {t} = useTranslation()
  const router = useRouter()

  useEffect(() => {
    initializeReporterId()
      .then((id) => {
        console.log('Unique Reporter ID initialized:', id)
      })
      .catch((error) => {
        console.error('Failed to initialize reporter ID:', error)
      })
  }, [])

  return (
    <EnvironmentProvider>
      <AppErrorBoundary>
        <AuthProvider>
          <NotificationsProvider>
            <Stack
              screenOptions={{
                headerShown: true,
                headerTitle: t('common.header'),
                headerShadowVisible: true,
                headerLeft: () => (
                  <Image
                    source={require('../assets/images/sofia-gerb.png')}
                    style={{
                      width: 24,
                      height: 24,
                      marginLeft: 6,
                      borderRadius: 12,
                    }}
                  />
                ),
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/profile')}
                    accessibilityLabel={t('profile.title')}
                  >
                    <User size={24} style={{marginLeft: 6}} color={colors.primary} />
                  </TouchableOpacity>
                ),
              }}
            >
              <Stack.Screen name="(tabs)" options={{headerShown: true}} />
              <Stack.Screen
                name="auth/login"
                options={{
                  headerTitle: t('auth.login'),
                  headerLeft: undefined,
                  headerBackVisible: true,
                }}
              />
              <Stack.Screen
                name="auth/register"
                options={{
                  headerTitle: t('auth.register'),
                  headerLeft: undefined,
                  headerBackVisible: true,
                }}
              />
              <Stack.Screen
                name="whats-new"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </NotificationsProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </EnvironmentProvider>
  )
}
