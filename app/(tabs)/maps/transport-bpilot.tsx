import React from 'react'
import {View, StyleSheet, ActivityIndicator, Text, Linking} from 'react-native'
import {WebView} from 'react-native-webview'
import {useTranslation} from 'react-i18next'
import {colors, fontSizes} from '@/styles/tokens'

export default function TransportMap() {
  const {t} = useTranslation()

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: 'https://map.bpilot253.com/#/sofia'}}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('map.loading')}</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const {nativeEvent} = syntheticEvent
          console.warn('WebView error: ', nativeEvent)
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        allowsFullscreenVideo={true}
      />
      <View style={styles.attributionContainer}>
        <Text style={styles.attributionText}>
          Map and content provided by BPilot253 via{' '}
          <Text
            style={styles.attributionLink}
            onPress={() => Linking.openURL('https://map.bpilot253.com')}
          >
            bpilot253.com
          </Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: 12,
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  attributionContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  attributionLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
})
