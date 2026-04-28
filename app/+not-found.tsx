import {Link, Stack} from 'expo-router'
import {StyleSheet, Text, View} from 'react-native'
import {fonts, fontSizes} from '@/styles/tokens'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{title: 'Oops!'}} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.bold,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
