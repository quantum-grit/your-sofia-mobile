import {StyleSheet} from 'react-native'
import {colors, fonts, fontSizes, radius, spacing} from '@/styles/tokens'

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: fontSizes.caption,
    color: colors.error,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  selectOptionSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  selectOptionText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  selectOptionTextSelected: {
    color: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primaryTint,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.bodySm,
    color: colors.primary,
  },
  readOnlyValue: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
