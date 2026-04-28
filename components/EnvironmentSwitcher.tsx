import React, {useState} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Alert, TextInput} from 'react-native'
import * as Notifications from 'expo-notifications'
import {useEnvironment} from '@/contexts/EnvironmentContext'
import {Environment} from '@/lib/environment'
import {useTranslation} from 'react-i18next'
import {colors, fonts, fontSizes} from '@/styles/tokens'

const SIGNAL_STATUSES = ['in-progress', 'resolved', 'rejected'] as const
type SignalStatus = (typeof SIGNAL_STATUSES)[number]

export function EnvironmentSwitcher() {
  const {environment, config, setEnvironment, canSwitch, allEnvironments} = useEnvironment()
  const {t} = useTranslation()
  const [testSignalId, setTestSignalId] = useState('')
  const [testSignalStatus, setTestSignalStatus] = useState<SignalStatus>('resolved')

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

  const STATUS_LABELS: Record<SignalStatus, string> = {
    'in-progress': '🔧 В изпълнение',
    resolved: '✅ Приключен',
    rejected: '❌ Отхвърлен',
  }

  const STATUS_TITLES: Record<SignalStatus, string> = {
    'in-progress': 'Сигналът ви е в процес на обработка',
    resolved: 'Сигналът ви беше приключен',
    rejected: 'Сигналът ви беше отхвърлен',
  }

  const fireTestNotification = async (type: 'signal-status-update' | 'update') => {
    if (type === 'signal-status-update') {
      const signalId = testSignalId.trim() || '999'
      await Notifications.scheduleNotificationAsync({
        content: {
          title: STATUS_TITLES[testSignalStatus],
          body: `Статус на сигнал #${signalId}: ${testSignalStatus}`,
          data: {type: 'signal-status-update', signalId, status: testSignalStatus},
        },
        trigger: null,
      })
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ново градско съобщение',
          body: 'Тестово съобщение от града.',
          data: {type: 'update'},
        },
        trigger: null,
      })
    }
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

      <Text style={styles.testLabel}>Signal ID (optional)</Text>
      <TextInput
        style={styles.testInput}
        value={testSignalId}
        onChangeText={setTestSignalId}
        placeholder="e.g. 507f1f77bcf86cd799439011"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.testLabel}>Status</Text>
      <View style={styles.statusRow}>
        {SIGNAL_STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, testSignalStatus === s && styles.statusChipActive]}
            onPress={() => setTestSignalStatus(s)}
          >
            <Text
              style={[styles.statusChipText, testSignalStatus === s && styles.statusChipTextActive]}
            >
              {STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => fireTestNotification('signal-status-update')}
        >
          <Text style={styles.testButtonText}>Signal update</Text>
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
  testLabel: {
    fontSize: fontSizes.caption,
    color: '#555',
    fontFamily: fonts.semiBold,
    marginTop: 8,
    marginBottom: 4,
  },
  testInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: fontSizes.caption,
    marginBottom: 4,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#FFF',
  },
  statusChipActive: {
    backgroundColor: '#6366F1',
  },
  statusChipText: {
    fontSize: fontSizes.caption,
    color: '#4338CA',
  },
  statusChipTextActive: {
    color: '#FFF',
    fontFamily: fonts.semiBold,
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
