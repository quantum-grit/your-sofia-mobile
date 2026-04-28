import {useEffect} from 'react'
import {View, ActivityIndicator} from 'react-native'
import {useRouter} from 'expo-router'
import {shouldShowWhatsNew} from '@/lib/whatsNew'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    shouldShowWhatsNew().then((show) => {
      router.replace('/(tabs)/home')
      if (show) {
        router.push('/whats-new')
      }
    })
  }, [])

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator />
    </View>
  )
}
