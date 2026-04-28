import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native'
import {
  CreditCard,
  Zap,
  Home,
  Car,
  Droplets,
  Wifi,
  Receipt,
  ChevronRight,
  Search,
  Clock,
} from 'lucide-react-native'
import {useTranslation} from 'react-i18next'
import {colors, fonts, fontSizes} from '@/styles/tokens'

interface Bill {
  id: number
  title: string
  icon: any
  color: string
  amount: string
  dueDate: string
  status: 'pending' | 'overdue'
}

interface Payment {
  id: number
  title: string
  amount: string
  date: string
  status: string
}

const getBillCategories = (t: (key: string) => string): Bill[] => [
  {
    id: 1,
    title: t('payments.bills.electricity'),
    icon: Zap,
    color: '#F59E0B',
    amount: '124.50',
    dueDate: t('payments.common.due') + ' Jan 15',
    status: 'pending',
  },
  {
    id: 2,
    title: t('payments.bills.waterSewer'),
    icon: Droplets,
    color: colors.primaryLight,
    amount: '89.20',
    dueDate: t('payments.common.due') + ' Jan 20',
    status: 'pending',
  },
  {
    id: 3,
    title: t('payments.bills.propertyTax'),
    icon: Home,
    color: colors.success,
    amount: '450.00',
    dueDate: t('payments.common.due') + ' Feb 1',
    status: 'pending',
  },
  {
    id: 4,
    title: t('payments.bills.parkingFines'),
    icon: Car,
    color: colors.error,
    amount: '25.00',
    dueDate: t('payments.status.overdue'),
    status: 'overdue',
  },
]

const getRecentPayments = (t: (key: string) => string): Payment[] => [
  {
    id: 1,
    title: t('payments.bills.electricity'),
    amount: '98.30',
    date: 'Dec 15, 2024',
    status: t('payments.status.paid'),
  },
  {
    id: 2,
    title: t('payments.bills.waterSewer'),
    amount: '76.45',
    date: 'Dec 10, 2024',
    status: t('payments.status.paid'),
  },
  {
    id: 3,
    title: t('payments.bills.waterSewer'),
    amount: '35.00',
    date: 'Dec 5, 2024',
    status: t('payments.status.paid'),
  },
]

export default function PaymentsScreen() {
  const {t} = useTranslation()
  const billCategories = getBillCategories(t)
  const recentPayments = getRecentPayments(t)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Търси сметки и услуги..."
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Outstanding Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Предстоящи плащания</Text>
            <Text style={styles.totalAmount}>Общо: 688.70 лв</Text>
          </View>

          <View style={styles.billsList}>
            {billCategories.map((bill: Bill) => {
              const IconComponent = bill.icon
              return (
                <TouchableOpacity
                  key={bill.id}
                  style={[styles.billCard, bill.status === 'overdue' && styles.overdueBill]}
                >
                  <View style={styles.billContent}>
                    <View style={[styles.billIcon, {backgroundColor: bill.color}]}>
                      <IconComponent size={24} color={colors.surface} />
                    </View>
                    <View style={styles.billInfo}>
                      <Text style={styles.billTitle}>{bill.title}</Text>
                      <Text
                        style={[
                          styles.billDueDate,
                          bill.status === 'overdue' && styles.overdueDueDate,
                        ]}
                      >
                        {bill.dueDate}
                      </Text>
                    </View>
                    <View style={styles.billAmountContainer}>
                      <Text style={styles.billAmount}>{bill.amount} лв</Text>
                      <ChevronRight size={20} color={colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity style={styles.payAllButton}>
            <CreditCard size={20} color={colors.surface} />
            <Text style={styles.payAllButtonText}>Плати всички сметки</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Бързи плащания</Text>
          <View style={styles.quickPaymentGrid}>
            <TouchableOpacity style={styles.quickPaymentCard}>
              <Wifi size={24} color={colors.primary} />
              <Text style={styles.quickPaymentText}>Интернет</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickPaymentCard}>
              <Receipt size={24} color={colors.primary} />
              <Text style={styles.quickPaymentText}>Друго плащане</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('payments.common.recentPayments')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Виж всички</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentPaymentsList}>
            {recentPayments.map((payment: Payment) => (
              <View key={payment.id} style={styles.paymentHistoryCard}>
                <View style={styles.paymentHistoryIcon}>
                  <Receipt size={20} color={colors.success} />
                </View>
                <View style={styles.paymentHistoryInfo}>
                  <Text style={styles.paymentHistoryTitle}>{payment.title}</Text>
                  <View style={styles.paymentHistoryMeta}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={styles.paymentHistoryDate}>{payment.date}</Text>
                  </View>
                </View>
                <View style={styles.paymentHistoryAmount}>
                  <Text style={styles.paymentHistoryAmountText}>-{payment.amount} лв</Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>{payment.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payments.common.paymentMethods')}</Text>
          <View style={styles.paymentMethodCard}>
            <CreditCard size={24} color={colors.primary} />
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodTitle}>{t('payments.common.debitCreditCard')}</Text>
              <Text style={styles.paymentMethodDescription}>
                {t('payments.common.cardsAccepted')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: fontSizes.h2,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: fontSizes.body,
    color: colors.error,
  },
  viewAllText: {
    fontSize: fontSizes.bodySm,
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  billsList: {
    gap: 12,
  },
  billCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  overdueBill: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  billContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  billDueDate: {
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
  },
  overdueDueDate: {
    color: colors.error,
    fontFamily: fonts.medium,
  },
  billAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billAmount: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  payAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  payAllButtonText: {
    color: colors.surface,
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
  },
  quickPaymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickPaymentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickPaymentText: {
    fontSize: fontSizes.bodySm,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    marginTop: 8,
    textAlign: 'center',
  },
  recentPaymentsList: {
    gap: 12,
  },
  paymentHistoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentHistoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentHistoryInfo: {
    flex: 1,
  },
  paymentHistoryTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentHistoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentHistoryDate: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  paymentHistoryAmount: {
    alignItems: 'flex-end',
  },
  paymentHistoryAmountText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paidBadgeText: {
    fontSize: 10,
    color: colors.success,
    fontFamily: fonts.medium,
  },
  paymentMethodCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 20,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: fontSizes.bodySm,
    color: colors.textSecondary,
  },
})
