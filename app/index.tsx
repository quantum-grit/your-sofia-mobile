import {useEffect} from 'react'
import {View, ActivityIndicator} from 'react-native'
import {useRouter} from 'expo-router'
import {shouldShowWhatsNew} from '@/lib/whatsNew'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    shouldShowWhatsNew().then((show) => {
      if (show) {
        router.replace('/whats-new')
      } else {
        router.replace('/(tabs)/home')
      }
    })
  }, [])

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator />
    </View>
  )
}
