/**
 * Design tokens for Твоята София — sourced from DESIGN.md
 * Single source of truth for colors, typography, spacing, and radius.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Primary
  primary: '#2F54C5',
  primaryDark: '#082E8E',
  primaryLight: '#5078F0',
  primaryTint: '#EEF2FF',

  // Accent
  accentGold: '#E0B340',
  accentGoldLight: '#FEF3C0',

  // Neutrals
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Semantic
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',
} as const

// ─── Typography ──────────────────────────────────────────────────────────────

export const fonts = {
  regular: 'SofiaSans_400Regular',
  medium: 'SofiaSans_500Medium',
  semiBold: 'SofiaSans_600SemiBold',
  bold: 'SofiaSans_700Bold',
  extraBold: 'SofiaSans_800ExtraBold',
  monoRegular: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoSemiBold: 'JetBrainsMono_600SemiBold',
} as const

export const fontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  bodySm: 14,
  label: 13,
  caption: 12,
  dataLg: 32,
  dataSm: 13,
} as const

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 20,
  full: 9999,
} as const
