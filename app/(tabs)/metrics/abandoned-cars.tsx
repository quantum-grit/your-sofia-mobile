import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useTranslation} from 'react-i18next'
import {colors, fontSizes} from '@/styles/tokens'

export default function AbandonedCarsDashboard() {
  const {t} = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('metrics.tabCars')}</Text>
      <Text style={styles.text}>{t('metrics.comingSoonSubtitle')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40},
  title: {fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: 8},
  text: {fontSize: 15, color: colors.textMuted},
})
