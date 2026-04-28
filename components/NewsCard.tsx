import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native'
import {useRouter} from 'expo-router'
import type {NewsItem} from '../types/news'
import {getCategoryColor} from '@/lib/categories'
import {colors, fonts, fontSizes, radius, spacing} from '@/styles/tokens'

interface NewsCardProps {
  item: NewsItem
}

export function NewsCard({item}: NewsCardProps) {
  const router = useRouter()
  const primaryCategory = item.categories?.[0] ?? item.topic
  const borderColor = getCategoryColor(primaryCategory)

  return (
    <TouchableOpacity
      style={[styles.container, {borderLeftColor: borderColor}]}
      onPress={() => router.push(`/(tabs)/home/${item.id}`)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={item.title ?? item.date}
      accessibilityHint="Отваря новинарска статия"
    >
      {item.image && (
        <Image
          source={{uri: item.image}}
          style={styles.image}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
      <View style={styles.content}>
        {item.title ? (
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        ) : null}
        {item.snippet ? (
          <Text style={styles.snippet} numberOfLines={2}>
            {item.snippet}
          </Text>
        ) : null}
        <Text style={styles.description} numberOfLines={2}>
          {item.sourceName || item.description}
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.textMuted,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface2,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  snippet: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  date: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
})
