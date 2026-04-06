import {formatLocationFilter} from '../../lib/formatLocationFilter'
import type {LocationFilter} from '../../types/subscription'

// Simple t() stub that returns the key so assertions are readable
const t = (key: string) => key

describe('formatLocationFilter', () => {
  it('returns locationTypeAll for "all" filter', () => {
    const filter: LocationFilter = {filterType: 'all'}
    expect(formatLocationFilter(filter, t)).toBe('notifications.locationTypeAll')
  })

  it('returns district name with prefix for district filter (object name)', () => {
    const filter: LocationFilter = {
      filterType: 'district',
      district: {id: 1, name: 'Средец', districtId: 1},
    }
    expect(formatLocationFilter(filter, t)).toBe('notifications.locationTypeDistrict: Средец')
  })

  it('falls back to String(id) when district is a plain id (not populated)', () => {
    const filter: LocationFilter = {filterType: 'district', district: 42}
    expect(formatLocationFilter(filter, t)).toBe('notifications.locationTypeDistrict: 42')
  })

  it('formats point radius in metres when radius < 1000', () => {
    const filter: LocationFilter = {
      filterType: 'point',
      latitude: 42.7,
      longitude: 23.3,
      radius: 500,
    }
    const result = formatLocationFilter(filter, t)
    // label = t('notifications.radiusM').replace('{{n}}', '500')
    expect(result).toBe('notifications.locationTypePoint (notifications.radiusM)')
  })

  it('formats point radius in km when radius >= 1000', () => {
    const filter: LocationFilter = {
      filterType: 'point',
      latitude: 42.7,
      longitude: 23.3,
      radius: 2000,
    }
    const result = formatLocationFilter(filter, t)
    expect(result).toBe('notifications.locationTypePoint (notifications.radiusKm)')
  })

  it('correctly inserts km value (2000m → 2.0 km) into label', () => {
    const tReal = (key: string) => {
      const map: Record<string, string> = {
        'notifications.locationTypePoint': 'Точка с радиус',
        'notifications.radiusKm': '{{n}} км',
        'notifications.radiusM': '{{n}} м',
      }
      return map[key] ?? key
    }
    const filter: LocationFilter = {
      filterType: 'point',
      latitude: 42.7,
      longitude: 23.3,
      radius: 2000,
    }
    expect(formatLocationFilter(filter, tReal)).toBe('Точка с радиус (2.0 км)')
  })

  it('correctly inserts m value (500m) into label', () => {
    const tReal = (key: string) => {
      const map: Record<string, string> = {
        'notifications.locationTypePoint': 'Точка с радиус',
        'notifications.radiusKm': '{{n}} км',
        'notifications.radiusM': '{{n}} м',
      }
      return map[key] ?? key
    }
    const filter: LocationFilter = {
      filterType: 'point',
      latitude: 42.7,
      longitude: 23.3,
      radius: 500,
    }
    expect(formatLocationFilter(filter, tReal)).toBe('Точка с радиус (500 м)')
  })

  it('returns locationTypeArea for area filter', () => {
    const filter: LocationFilter = {
      filterType: 'area',
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [23.3, 42.7],
            [23.4, 42.7],
            [23.35, 42.8],
            [23.3, 42.7],
          ],
        ],
      },
    }
    expect(formatLocationFilter(filter, t)).toBe('notifications.locationTypeArea')
  })
})
