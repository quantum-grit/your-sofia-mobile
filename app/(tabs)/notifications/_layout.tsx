import {Stack} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {colors, fonts} from '@/styles/tokens'

export default function NotificationsLayout() {
  const {t} = useTranslation()

  return (
    <Stack
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.surface,
        headerTitleStyle: {fontFamily: fonts.semiBold},
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
