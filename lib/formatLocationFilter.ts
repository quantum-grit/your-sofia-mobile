import type {LocationFilter} from '../types/subscription'

export function formatLocationFilter(filter: LocationFilter, t: (k: string) => string): string {
  switch (filter.filterType) {
    case 'all':
      return t('notifications.locationTypeAll')
    case 'district': {
      const d = filter.district
      const name = typeof d === 'object' && d !== null && 'name' in d ? (d as any).name : String(d)
      return `${t('notifications.locationTypeDistrict')}: ${name}`
    }
    case 'point': {
      const r = filter.radius
      const label =
        r >= 1000
          ? t('notifications.radiusKm').replace('{{n}}', String((r / 1000).toFixed(1)))
          : t('notifications.radiusM').replace('{{n}}', String(r))
      return `${t('notifications.locationTypePoint')} (${label})`
    }
    case 'area':
      return t('notifications.locationTypeArea')
    default:
      return ''
  }
}
