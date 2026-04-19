import {Stack} from 'expo-router'
import {useTranslation} from 'react-i18next'

export default function NotificationsLayout() {
  const {t} = useTranslation()

  return (
    <Stack
      screenOptions={{
        headerStyle: {backgroundColor: '#1E40AF'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: '600'},
      }}
    >
      <Stack.Screen name="index" options={{title: t('notifications.title')}} />
      <Stack.Screen
        name="district-picker"
        options={{title: t('notifications.selectDistrict'), presentation: 'modal'}}
      />
      <Stack.Screen
        name="point-picker"
        options={{title: t('notifications.pickPoint'), presentation: 'modal'}}
      />
      <Stack.Screen
        name="area-picker"
        options={{title: t('notifications.drawArea'), presentation: 'modal'}}
      />
    </Stack>
  )
}
