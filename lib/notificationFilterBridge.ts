/**
 * Lightweight bridge for passing a location filter result from a picker screen
 * back to the notifications index screen.
 *
 * Usage:
 *   Notifications screen registers a listener on mount and clears it on unmount.
 *   Picker screens call `emitNotificationFilter(filter)` before navigating back.
 *
 * This avoids polluting `global` and is safe against concurrent renders because
 * only one listener is ever active at a time (the notifications screen is a single
 * instance in the Expo Router stack).
 */

import type {LocationFilter} from '../types/subscription'

type FilterListener = (filter: Omit<LocationFilter, 'id'>) => void

let _listener: FilterListener | null = null

export function registerNotificationFilterListener(fn: FilterListener): () => void {
  _listener = fn
  return () => {
    if (_listener === fn) _listener = null
  }
}

export function emitNotificationFilter(filter: Omit<LocationFilter, 'id'>): void {
  _listener?.(filter)
}
