import React from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native'
import * as Notifications from 'expo-notifications'
import {useEnvironment} from '@/contexts/EnvironmentContext'
import {Environment} from '@/lib/environment'
import {useTranslation} from 'react-i18next'
import {colors, fonts, fontSizes} from '@/styles/tokens'

export function EnvironmentSwitcher() {
  const {environment, config, setEnvironment, canSwitch, allEnvironments} = useEnvironment()
  const {t} = useTranslation()

  if (!canSwitch) {
    return null // Don't show switcher in production builds
  }

  const handleEnvironmentChange = async (newEnv: Environment) => {
    if (newEnv === environment) return

    Alert.alert(
      t('settings.changeEnvironment'),
      t('settings.changeEnvironmentWarning', {env: newEnv}),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await setEnvironment(newEnv)
              Alert.alert(t('common.success'), t('settings.environmentChanged', {env: newEnv}))
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.environmentChangeFailed'))
            }
          },
        },
      ]
    )
  }

  const fireTestNotification = async (type: 'signal-closed' | 'update') => {
    await Notifications.scheduleNotificationAsync({
      content:
        type === 'signal-closed'
          ? {
              title: 'Сигналът ви беше затворен',
              body: 'Вашият сигнал "Тест" беше разрешен.',
              data: {type: 'signal-closed', signalId: '999', status: 'resolved'},
            }
          : {
              title: 'Ново градско съобщение',
              body: 'Тестово съобщение от града.',
              data: {type: 'update'},
            },
      trigger: null, // fire immediately
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 {t('settings.apiEnvironment')}</Text>
      <Text style={styles.subtitle}>{t('settings.devModeOnly')}</Text>
      <Text style={styles.current}>
        {t('settings.current')}: {config.displayName}
      </Text>
      <Text style={styles.url}>URL: {config.apiUrl}</Text>

      <View style={styles.buttons}>
        {allEnvironments.map((env) => (
          <TouchableOpacity
            key={env.name}
            style={[styles.button, env.name === environment && styles.buttonActive]}
            onPress={() => handleEnvironmentChange(env.name)}
          >
            <Text style={[styles.buttonText, env.name === environment && styles.buttonTextActive]}>
              {env.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.testTitle}>🔔 Test notifications</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => fireTestNotification('signal-closed')}
        >
          <Text style={styles.testButtonText}>Signal closed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={() => fireTestNotification('update')}>
          <Text style={styles.testButtonText}>City update</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
    marginVertical: 16,
  },
  title: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSizes.caption,
    color: '#666',
    marginBottom: 12,
  },
  current: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  url: {
    fontSize: fontSizes.caption,
    color: '#666',
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: fontSizes.caption,
    color: '#333',
  },
  buttonTextActive: {
    color: '#FFF',
    fontFamily: fonts.semiBold,
  },
  testTitle: {
    fontSize: fontSizes.label,
    marginTop: 16,
    marginBottom: 8,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6366F1',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: fontSizes.caption,
    color: '#4338CA',
    fontFamily: fonts.semiBold,
  },
})
