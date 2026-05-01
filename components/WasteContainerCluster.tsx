import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {Container} from 'lucide-react-native'

interface WasteContainerClusterProps {
  count: number
  dominantStatus: string
  activeSignalCount: number
}

function clusterColor(dominantStatus: string, activeSignalCount: number): string {
  if (dominantStatus === 'inactive' || dominantStatus === 'pending') return '#9CA3AF'
  if (dominantStatus === 'full') return 'red'
  if (dominantStatus === 'maintenance' || activeSignalCount > 0) return 'orange'
  return 'green'
}

export function WasteContainerCluster({
  count,
  dominantStatus,
  activeSignalCount,
}: WasteContainerClusterProps) {
  const bg = clusterColor(dominantStatus, activeSignalCount)
  const size = count >= 1000 ? 52 : count >= 100 ? 44 : count >= 10 ? 36 : 28
  const label = count >= 1000 ? `${Math.floor(count / 1000)}k+` : String(count)
  const iconSize = Math.round(size * 0.42)
  const fontSize = size >= 44 ? 13 : size >= 36 ? 11 : 10

  return (
    <View style={[styles.wrapper, {width: size, height: size}]}>
      {/* Base icon — reuses the same rounded-square style as WasteContainerMarker */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: bg,
            width: size,
            height: size,
            borderRadius: 12,
          },
        ]}
      >
        <Container size={iconSize} color="#fff" strokeWidth={2} />
      </View>

      {/* Count badge — absolute top-right */}
      <View style={[styles.badge, {backgroundColor: bg, borderRadius: size / 2}]}>
        <Text style={[styles.badgeText, {fontSize}]}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
  },
})
