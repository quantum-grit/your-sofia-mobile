import React, {useState} from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {CartesianChart, StackedBar, Bar} from 'victory-native'
import {Text as SkiaText, matchFont} from '@shopify/react-native-skia'
import {useCollectionMetrics, MetricsRange} from '../../../hooks/useCollectionMetrics'
import {colors, fonts, fontSizes} from '@/styles/tokens'

type ChartTab = 'zone' | 'district'

function colorByBucketOrder(order: number): string {
  if (order === 0) return colors.success
  if (order === 1) return '#F97316'
  return colors.error
}

export default function WasteCollectionDashboard() {
  const {t} = useTranslation()
  const [range, setRange] = useState<MetricsRange>('week')
  const [chartTab, setChartTab] = useState<ChartTab>('zone')
  const {data, loading, error, refresh} = useCollectionMetrics(range)
  const font = matchFont({fontSize: 10})

  const totalContainers = data?.byZone.reduce((s, z) => s + z.totalContainers, 0) ?? 0
  const totalCollected = data?.byZone.reduce((s, z) => s + z.collectedContainers, 0) ?? 0
  const districtsWithData = data?.byDistrict.filter((d) => d.collectedContainers > 0).length ?? 0

  const zoneData =
    data?.byZone.map((z) => ({
      name: z.zoneName,
      collected: z.collectedContainers,
      notCollected: z.totalContainers - z.collectedContainers,
      total: z.totalContainers,
    })) ?? []

  const districtData =
    data?.byDistrict.map((d) => ({
      name: d.districtName.slice(0, 8),
      collected: d.collectedContainers,
      notCollected: d.totalContainers - d.collectedContainers,
      total: d.totalContainers,
    })) ?? []

  const histogramData =
    data?.byTimeSinceCollection.map((b) => ({
      bucket: b.bucket,
      bucketOrder: b.bucketOrder,
      count: b.containerCount,
    })) ?? []

  const compliance = data?.scheduleCompliance
  const complianceData = compliance
    ? [
        {
          status: t('metrics.complianceOnTime'),
          count: Math.max(0, compliance.scheduledToday - compliance.delayed),
          color: colors.success,
        },
        {
          status: t('metrics.complianceDelayed'),
          count: Math.max(0, compliance.delayed - compliance.missed),
          color: '#F97316',
        },
        {
          status: t('metrics.complianceMissed'),
          count: compliance.missed,
          color: colors.error,
        },
      ]
    : []

  const chartData = chartTab === 'zone' ? zoneData : districtData

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      {/* Date range selector */}
      <View style={styles.rangeRow}>
        {(['day', 'week', 'month'] as MetricsRange[]).map((r) => (
          <Pressable
            key={r}
            style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
              {t(`metrics.last${r.charAt(0).toUpperCase() + r.slice(1)}` as any)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary cards */}
      {data && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: colors.textSecondary}]}>
              {totalContainers}
            </Text>
            <Text style={styles.summaryLabel}>{t('metrics.summaryTotal')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: colors.primary}]}>{totalCollected}</Text>
            <Text style={styles.summaryLabel}>{t('metrics.summaryCollected')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: colors.success}]}>{data.byZone.length}</Text>
            <Text style={styles.summaryLabel}>{t('metrics.summaryZones')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: '#D97706'}]}>{districtsWithData}</Text>
            <Text style={styles.summaryLabel}>{t('metrics.summaryDistricts')}</Text>
          </View>
        </View>
      )}

      {/* Chart tab toggle */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, chartTab === 'zone' && styles.tabBtnActive]}
          onPress={() => setChartTab('zone')}
        >
          <Text style={[styles.tabBtnText, chartTab === 'zone' && styles.tabBtnTextActive]}>
            {t('metrics.byZone')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, chartTab === 'district' && styles.tabBtnActive]}
          onPress={() => setChartTab('district')}
        >
          <Text style={[styles.tabBtnText, chartTab === 'district' && styles.tabBtnTextActive]}>
            {t('metrics.byDistrict')}
          </Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('metrics.loading')}</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('metrics.errorTitle')}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryBtnText}>{t('metrics.retry')}</Text>
          </Pressable>
        </View>
      )}

      {/* Chart */}
      {!loading && !error && data && (
        <View style={styles.chartSection}>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: colors.border}]} />
              <Text style={styles.legendText}>{t('metrics.totalContainers')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: colors.primary}]} />
              <Text style={styles.legendText}>{t('metrics.collected')}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{width: Math.max(360, chartData.length * 56), height: 300}}>
              <CartesianChart
                data={chartData}
                xKey="name"
                yKeys={['collected', 'notCollected', 'total']}
                domainPadding={{left: 20, right: 20, top: 20}}
                axisOptions={{
                  font,
                  tickCount: {x: chartData.length, y: 5},
                  labelColor: colors.textSecondary,
                  lineColor: colors.border,
                }}
              >
                {({points, chartBounds}) => (
                  <>
                    <StackedBar
                      points={[points.collected, points.notCollected]}
                      chartBounds={chartBounds}
                      colors={[colors.primary, colors.border]}
                      barOptions={({isTop}) =>
                        isTop ? {roundedCorners: {topLeft: 3, topRight: 3}} : {}
                      }
                    />
                    {points.collected.map((point, i) => {
                      const val = chartData[i]?.collected ?? 0
                      if (val === 0 || point.y == null) return null
                      const label = String(val)
                      return (
                        <SkiaText
                          key={i}
                          x={point.x - label.length * 3}
                          y={(point.y ?? 0) - 4}
                          text={label}
                          font={font}
                          color={colors.primary}
                        />
                      )
                    })}
                  </>
                )}
              </CartesianChart>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Empty state */}
      {!loading && !error && data && chartData.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('metrics.noData')}</Text>
        </View>
      )}

      {/* Histogram: time since last collection */}
      {!loading && !error && data && (
        <View style={[styles.chartSection, {marginTop: 8}]}>
          <Text style={styles.sectionTitle}>{t('metrics.timeSinceCollection')}</Text>
          {histogramData.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>{t('metrics.noData')}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{width: Math.max(300, histogramData.length * 64), height: 240}}>
                <CartesianChart
                  data={histogramData}
                  xKey="bucket"
                  yKeys={['count']}
                  domainPadding={{left: 20, right: 20, top: 24}}
                  axisOptions={{
                    font,
                    tickCount: {x: histogramData.length, y: 5},
                    labelColor: colors.textSecondary,
                    lineColor: colors.border,
                  }}
                >
                  {({points, chartBounds}) => (
                    <>
                      {points.count.map((point, i) => (
                        <Bar
                          key={i}
                          points={[point]}
                          barCount={points.count.length}
                          chartBounds={chartBounds}
                          color={colorByBucketOrder(histogramData[i]?.bucketOrder ?? i)}
                          roundedCorners={{topLeft: 4, topRight: 4}}
                          labels={{
                            position: 'top',
                            font,
                            color: colorByBucketOrder(histogramData[i]?.bucketOrder ?? i),
                          }}
                        />
                      ))}
                    </>
                  )}
                </CartesianChart>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Schedule compliance bar chart */}
      {!loading && !error && data && (
        <View style={[styles.chartSection, {marginTop: 8}]}>
          <Text style={styles.sectionTitle}>{t('metrics.scheduleCompliance')}</Text>
          <View style={styles.legend}>
            {complianceData.map((item) => (
              <View key={item.status} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: item.color}]} />
                <Text style={styles.legendText}>{item.status}</Text>
              </View>
            ))}
          </View>
          <View style={{width: 300, height: 220}}>
            <CartesianChart
              data={complianceData}
              xKey="status"
              yKeys={['count']}
              domainPadding={{left: 40, right: 40, top: 24}}
              axisOptions={{
                font,
                tickCount: {x: 3, y: 5},
                labelColor: colors.textSecondary,
                lineColor: colors.border,
              }}
            >
              {({points, chartBounds}) => (
                <>
                  {points.count.map((point, i) => (
                    <Bar
                      key={i}
                      points={[point]}
                      barCount={3}
                      chartBounds={chartBounds}
                      color={complianceData[i]?.color ?? colors.textSecondary}
                      roundedCorners={{topLeft: 4, topRight: 4}}
                      labels={{
                        position: 'top',
                        font,
                        color: complianceData[i]?.color ?? colors.textSecondary,
                      }}
                    />
                  ))}
                </>
              )}
            </CartesianChart>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {paddingBottom: 32},
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  rangeBtnActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  rangeBtnText: {fontSize: fontSizes.label, color: colors.textPrimary, fontFamily: fonts.medium},
  rangeBtnTextActive: {color: colors.surface, fontFamily: fonts.semiBold},
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: 72,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryValue: {fontSize: fontSizes.h3, fontFamily: fonts.bold},
  summaryLabel: {fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center'},
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
  },
  tabBtn: {flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6},
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabBtnText: {fontSize: fontSizes.label, color: colors.textSecondary, fontFamily: fonts.medium},
  tabBtnTextActive: {color: colors.primary, fontFamily: fonts.semiBold},
  center: {alignItems: 'center', justifyContent: 'center', padding: 40},
  loadingText: {marginTop: 12, color: colors.textSecondary, fontSize: fontSizes.bodySm},
  errorText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.error,
    marginBottom: 6,
  },
  errorDetail: {fontSize: fontSizes.label, color: colors.textSecondary, marginBottom: 16},
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {color: colors.surface, fontFamily: fonts.semiBold, fontSize: fontSizes.bodySm},
  emptyText: {color: colors.textMuted, fontSize: fontSizes.bodySm},
  chartSection: {paddingHorizontal: 16, paddingTop: 8},
  sectionTitle: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  legend: {flexDirection: 'row', gap: 16, marginBottom: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 10, height: 10, borderRadius: 2},
  legendText: {fontSize: fontSizes.caption, color: colors.textSecondary},
})
