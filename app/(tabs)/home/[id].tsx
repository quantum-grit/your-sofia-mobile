import React from 'react'
import {View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Linking} from 'react-native'
import {useLocalSearchParams} from 'expo-router'
import {useTranslation} from 'react-i18next'
import Markdown from 'react-native-markdown-display'
import {useUpdateById} from '@/hooks/useUpdateById'
import {colors, fonts, fontSizes} from '@/styles/tokens'

export default function NewsDetail() {
  const {id} = useLocalSearchParams<{id: string}>()
  const {t} = useTranslation()
  const {newsItem, loading, error} = useUpdateById(id)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error || !newsItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || t('common.error')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {newsItem.image && (
          <Image source={{uri: newsItem.image}} style={styles.image} resizeMode="contain" />
        )}

        <View style={styles.content}>
          {newsItem.title ? <Text style={styles.title}>{newsItem.title}</Text> : null}
          <Text style={styles.date}>{newsItem.date}</Text>

          {newsItem.snippet ? <Text style={styles.description}>{newsItem.snippet}</Text> : null}

          {newsItem.markdownText ? (
            <Markdown
              style={markdownStyles}
              onLinkPress={(url) => {
                Linking.openURL(url)
                return false
              }}
            >
              {newsItem.markdownText}
            </Markdown>
          ) : (
            <Text style={styles.contentText}>{newsItem.rawText || ''}</Text>
          )}

          {newsItem.sourceUrl ? (
            <Text style={styles.sourceLink} onPress={() => Linking.openURL(newsItem.sourceUrl!)}>
              {newsItem.sourceUrl}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 332,
    backgroundColor: '#aedcedff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: fontSizes.h2,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 32,
  },
  date: {
    fontSize: fontSizes.bodySm,
    color: colors.textMuted,
    marginBottom: 16,
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  sourceLink: {
    fontSize: fontSizes.label,
    color: colors.primary,
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface2,
  },
  errorText: {
    fontSize: fontSizes.body,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
})

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  heading1: {
    fontSize: fontSizes.h2,
    lineHeight: 32,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  heading2: {
    fontSize: fontSizes.h3,
    lineHeight: 28,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    color: colors.textPrimary,
    lineHeight: 24,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  strong: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
})
