import {useState, useEffect, useCallback} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {fetchMySubscription, createSubscription, updateSubscription} from '../lib/payload'
import type {Subscription, LocationFilter, SubscriptionCategory} from '../types/subscription'

const PUSH_TOKEN_KEY = 'pushToken'
const SUBSCRIPTION_ID_KEY = 'subscriptionId'

interface UseSubscriptionReturn {
  subscription: Subscription | null
  isLoading: boolean
  error: string | null
  /** Persist category + location preferences. Creates subscription if needed, patches if exists. */
  saveSubscription: (
    categories: (string | number)[],
    locationFilters: Omit<LocationFilter, 'id'>[],
    authToken?: string | null
  ) => Promise<void>
  /** Link the current subscription to an authenticated user. Called after login. */
  linkUser: (userId: number | string, authToken: string) => Promise<void>
  reload: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY)
      if (!token) {
        setSubscription(null)
        return
      }

      // Fast path: we already know the subscription id
      const cachedId = await AsyncStorage.getItem(SUBSCRIPTION_ID_KEY)
      const sub = await fetchMySubscription(token)

      if (sub) {
        // Cache id for fast writes
        if (!cachedId || String(cachedId) !== String(sub.id)) {
          await AsyncStorage.setItem(SUBSCRIPTION_ID_KEY, String(sub.id))
        }
        setSubscription(sub)
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error('[useSubscription] load error', err)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveSubscription = useCallback(
    async (
      categories: (string | number)[],
      locationFilters: Omit<LocationFilter, 'id'>[],
      authToken?: string | null
    ) => {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY)
      if (!token) throw new Error('No push token registered on this device')

      const cachedId = await AsyncStorage.getItem(SUBSCRIPTION_ID_KEY)

      if (cachedId || subscription?.id) {
        const id = cachedId ?? subscription!.id
        const updated = await updateSubscription(id, {categories, locationFilters}, authToken)
        setSubscription(updated)
        await AsyncStorage.setItem(SUBSCRIPTION_ID_KEY, String(updated.id))
      } else {
        // Need the push-token document id first (server-side lookup)
        const existing = await fetchMySubscription(token)
        if (existing) {
          await AsyncStorage.setItem(SUBSCRIPTION_ID_KEY, String(existing.id))
          const updated = await updateSubscription(
            existing.id,
            {categories, locationFilters},
            authToken
          )
          setSubscription(updated)
        } else {
          // We only have the token string — creation requires the push-token document id.
          // The POST body accepts the token string via the `token` helper endpoint behaviour,
          // but the Payload REST API requires the pushToken relationship id.
          // Resolve the push-token doc id from the server.
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/api/push-tokens?where[token][equals]=${encodeURIComponent(token)}&limit=1`
          )
          if (!response.ok) throw new Error('Could not resolve push token document')
          const data = await response.json()
          if (!data.docs?.length) throw new Error('Push token not registered on server')
          const pushTokenId = data.docs[0].id

          const created = await createSubscription({
            pushToken: pushTokenId,
            categories,
            locationFilters,
          })
          setSubscription(created)
          await AsyncStorage.setItem(SUBSCRIPTION_ID_KEY, String(created.id))
        }
      }
    },
    [subscription]
  )

  const linkUser = useCallback(
    async (userId: number | string, authToken: string) => {
      const cachedId = await AsyncStorage.getItem(SUBSCRIPTION_ID_KEY)
      if (!cachedId && !subscription?.id) return // nothing to link

      const id = cachedId ?? subscription!.id
      try {
        const updated = await updateSubscription(id, {user: userId}, authToken)
        setSubscription(updated)
      } catch (err) {
        console.warn('[useSubscription] linkUser failed (non-fatal):', err)
      }
    },
    [subscription]
  )

  return {
    subscription,
    isLoading,
    error,
    saveSubscription,
    linkUser,
    reload: load,
  }
}
