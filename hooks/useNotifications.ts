import {useState, useEffect, useRef} from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import {Platform} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const PUSH_TOKEN_KEY = 'pushToken'
const UNREAD_COUNT_KEY = 'unreadNotificationCount'

// Configure how notifications are displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log('[useNotifications] Push token obtained:', token)
        setExpoPushToken(token)
        // Send token to backend
        sendTokenToBackend(token)
      } else {
        console.log('[useNotifications] No push token obtained (simulator or permission denied)')
      }
    })

    // Load unread count from storage
    loadUnreadCount()

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification)
      incrementUnreadCount()
    })

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response)
      // You can handle navigation here
    })

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [])

  const loadUnreadCount = async () => {
    try {
      const count = await AsyncStorage.getItem(UNREAD_COUNT_KEY)
      setUnreadCount(count ? parseInt(count, 10) : 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const incrementUnreadCount = async () => {
    try {
      const newCount = unreadCount + 1
      setUnreadCount(newCount)
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, newCount.toString())
    } catch (error) {
      console.error('Error incrementing unread count:', error)
    }
  }

  const clearUnreadCount = async () => {
    try {
      setUnreadCount(0)
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, '0')
    } catch (error) {
      console.error('Error clearing unread count:', error)
    }
  }

  const sendTokenToBackend = async (token: string) => {
    try {
      // Store token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token)
      console.log('[useNotifications] Push token saved to AsyncStorage:', token)

      // Send token to Payload backend
      console.log(
        '[useNotifications] Registering token with backend:',
        `${API_URL}/api/push-tokens`
      )
      const response = await fetch(`${API_URL}/api/push-tokens`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          token,
          device: Platform.OS,
          active: true,
        }),
      })

      if (!response.ok) {
        // Token might already exist, that's okay
        console.log(
          '[useNotifications] Token registration response (may already exist):',
          response.status
        )
      } else {
        const data = await response.json()
        console.log(
          '[useNotifications] Push token registered successfully, backend id:',
          data?.doc?.id ?? data?.id
        )
      }
    } catch (error) {
      console.error('[useNotifications] Error sending push token to backend:', error)
    }
  }

  return {
    expoPushToken,
    unreadCount,
    clearUnreadCount,
  }
}

async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  const {status: existingStatus} = await Notifications.getPermissionsAsync()
  console.log('[useNotifications] Existing permission status:', existingStatus)
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync()
    console.log('[useNotifications] Permission request result:', status)
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[useNotifications] Permission denied — cannot get push token')
    return null
  }

  console.log(
    '[useNotifications] Fetching Expo push token, projectId:',
    Constants.expoConfig?.extra?.eas?.projectId
  )
  token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data
  console.log('[useNotifications] Expo push token fetched:', token)

  return token
}
