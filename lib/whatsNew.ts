import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const STORAGE_KEY = 'last-seen-version'

function getCurrentVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0'
}

/**
 * Returns true if the current app version has not been seen by the user yet.
 * On first install, lastSeenVersion will be null — we do NOT show the splash
 * on first install (show onboarding instead). We show it only on version change.
 */
export async function shouldShowWhatsNew(): Promise<boolean> {
  try {
    const lastSeen = await AsyncStorage.getItem(STORAGE_KEY)
    return lastSeen !== getCurrentVersion()
  } catch {
    return false
  }
}

/**
 * Marks the current version as seen. Call this when the user dismisses the splash.
 */
export async function markWhatsNewSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, getCurrentVersion())
  } catch {
    // Non-fatal — worst case the splash shows again next launch
  }
}

/**
 * DEV ONLY — clears the stored version so the splash will show on next launch.
 * Call from EnvironmentSwitcher or a dev menu button.
 */
export async function resetWhatsNewForTesting(): Promise<void> {
  if (__DEV__) {
    await AsyncStorage.removeItem(STORAGE_KEY)
  }
}

export function getCurrentAppVersion(): string {
  return getCurrentVersion()
}
