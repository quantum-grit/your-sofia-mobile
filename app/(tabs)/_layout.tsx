import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  Home, 
  FileText, 
  CreditCard, 
  User,
  Bell,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';
import { BellActionProvider, useBellAction } from '../../contexts/BellActionContext';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <BellActionProvider>
      <TabLayoutContent t={t} />
    </BellActionProvider>
  );
}

function TabLayoutContent({ t }: { t: (key: string) => string }) {
  const { unreadCount } = useNotifications();
  const { triggerBellAction } = useBellAction();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerTitle: () => (
            <Text style={styles.headerTitle}>{t('common.goodMorning')}</Text>
          ),
          headerRight: () => {
            const { unreadCount, clearUnreadCount } = useNotifications();
            const { triggerBellAction } = useBellAction();
            
            const handleBellPress = () => {
              clearUnreadCount();
              triggerBellAction();
            };
            
            return (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleBellPress}
              >
                <Bell size={24} color="#6B7280" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t('common.cityService'),
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('common.quickServices'),
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('common.profile'),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});