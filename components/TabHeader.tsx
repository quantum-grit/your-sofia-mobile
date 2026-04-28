import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import {Bell, LucideIcon} from 'lucide-react-native'
import {useNotifications} from '../hooks/useNotifications'
import {useBellAction} from '../contexts/BellActionContext'
import {colors, fonts, fontSizes, radius} from '@/styles/tokens'

interface TabHeaderProps {
  title: string
  showActionIcon?: boolean
  ActionIcon?: LucideIcon
  onActionPress?: () => void
}

export function TabHeader({
  title,
  showActionIcon = false,
  ActionIcon = Bell,
  onActionPress,
}: TabHeaderProps) {
  const {unreadCount, clearUnreadCount} = useNotifications()
  const {triggerBellAction} = useBellAction()

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress()
    } else if (ActionIcon === Bell) {
      // Default bell behavior
      clearUnreadCount()
      triggerBellAction()
    }
  }

  const Icon = ActionIcon

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showActionIcon && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleActionPress}
          accessibilityRole="button"
          accessibilityLabel={
            ActionIcon === Bell
              ? unreadCount > 0
                ? `Известия, ${unreadCount} непрочетени`
                : 'Известия'
              : 'Действие'
          }
        >
          <Icon size={24} color={colors.textMuted} />
          {ActionIcon === Bell && unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  notificationBadgeText: {
    color: colors.surface,
    fontFamily: fonts.extraBold,
    fontSize: fontSizes.caption,
  },
})
