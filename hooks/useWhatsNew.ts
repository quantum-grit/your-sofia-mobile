import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {fetchNews, type PayloadNewsItem} from '@/lib/payload'

export interface WhatsNewState {
  items: PayloadNewsItem[]
  loading: boolean
  error: string | null
}

/**
 * Fetches the latest published news items to populate the What's New screen.
 * Uses the same News collection as the news feed — no dedicated endpoint needed.
 */
export function useWhatsNew(): WhatsNewState {
  const {i18n} = useTranslation()
  const [items, setItems] = useState<PayloadNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchNews({
          locale: i18n.language as 'bg' | 'en',
          topic: 'release-notes',
          limit: 4,
          page: 1,
        })
        if (!cancelled) {
          setItems(response.docs)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [i18n.language])

  return {items, loading, error}
}
