import React from 'react'
import {View, StyleSheet, ActivityIndicator, Text, Linking} from 'react-native'
import {WebView} from 'react-native-webview'
import {useTranslation} from 'react-i18next'

export default function BgsmetView() {
  const {t} = useTranslation()

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: 'https://www.bgsmet.com'}}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
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
      />
      <View style={styles.attributionContainer}>
        <Text style={styles.attributionText}>
          Map and content provided by BGSMET via{' '}
          <Text
            style={styles.attributionLink}
            onPress={() => Linking.openURL('https://www.bgsmet.com')}
          >
            bgsmet.com
          </Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
    fontSize: 12,
    color: '#6B7280',
  },
  attributionLink: {
    color: '#1E40AF',
    textDecorationLine: 'underline',
  },
})
