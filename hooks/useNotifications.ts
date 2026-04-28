// Re-export from context so all existing imports continue to work.
// The hook is now backed by NotificationsContext (shared singleton state).
export {useNotifications} from '../contexts/NotificationsContext'
