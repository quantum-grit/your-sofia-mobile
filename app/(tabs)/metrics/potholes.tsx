import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useTranslation} from 'react-i18next'
import {colors, fonts, fontSizes} from '@/styles/tokens'

export default function PotholesDashboard() {
  const {t} = useTranslation()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('metrics.tabPotholes')}</Text>
      <Text style={styles.text}>{t('metrics.comingSoonSubtitle')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40},
  title: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  text: {fontSize: 15, color: colors.textMuted},
})
