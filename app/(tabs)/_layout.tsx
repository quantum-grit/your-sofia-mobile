import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { 
  Home, 
  FileText, 
  CreditCard, 
  User,
  Settings 
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Image 
            source={require('../../assets/images/sofia-gerb.png')}
            style={{ width: 24, height: 24, marginLeft: 16, borderRadius: 12 }}
          />
        ),
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
          headerTitle: t('common.header'),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t('common.cityService'),
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          headerTitle: t('common.header'),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('common.quickServices'),
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
          headerTitle: t('common.header'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('common.profile'),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          headerTitle: t('common.header'),
        }}
      />
    </Tabs>
  );
}