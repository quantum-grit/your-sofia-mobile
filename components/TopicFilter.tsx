import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native'
import type {NewsFilterChip} from '../types/news'
import {getCategoryColor} from '@/lib/categories'

interface TopicFilterProps {
  selectedTopics: Set<string>
  onTopicsChange: (topics: Set<string>) => void
  topics: NewsFilterChip[]
}

export function TopicFilter({selectedTopics, onTopicsChange, topics}: TopicFilterProps) {
  const allSelected = selectedTopics.has('all')

  const handlePress = (id: string) => {
    if (id === 'all') {
      // Toggle all: if already showing all, go back to nothing (which also means all)
      onTopicsChange(new Set(['all']))
      return
    }
    const next = new Set(selectedTopics)
    next.delete('all')
    if (next.has(id)) {
      next.delete(id)
      // Nothing left → fall back to 'all'
      if (next.size === 0) next.add('all')
    } else {
      next.add(id)
    }
    onTopicsChange(next)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {topics.map((topic) => {
        const isSelected = topic.id === 'all' ? allSelected : selectedTopics.has(topic.id)
        const Icon = topic.icon
        const categoryColor = topic.id === 'all' ? '#1E40AF' : getCategoryColor(topic.id)

        return (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.chip,
              isSelected && {backgroundColor: categoryColor, borderColor: categoryColor},
            ]}
            onPress={() => handlePress(topic.id)}
          >
            {Icon && (
              <View style={styles.icon}>
                <Icon size={14} color={isSelected ? '#FFFFFF' : categoryColor} />
              </View>
            )}
            <Text style={[styles.label, isSelected ? styles.selectedLabel : styles.defaultLabel]}>
              {topic.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  defaultLabel: {
    color: '#4B5563',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
})
