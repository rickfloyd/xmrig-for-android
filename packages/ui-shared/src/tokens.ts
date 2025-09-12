// Design tokens for XMRig Android UI
// Dark-first theme system supporting both React Native and Web

export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9f3',
    100: '#dcf2e1',
    500: '#10b981', // emerald-500 - main brand green (crypto/mining theme)
    600: '#059669',
    700: '#047857',
    900: '#064e3b',
  },
  
  // Neutral grays (dark-first)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0e1a',
  },
  
  // Status colors
  success: {
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Special colors for mining/crypto theme
  hashrate: '#10b981', // green for positive hashrate
  thermal: {
    normal: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  },
  battery: {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
    charging: '#3b82f6',
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Dark theme (primary theme)
export const darkTheme = {
  colors: {
    background: colors.gray[900],
    surface: colors.gray[800],
    surfaceVariant: colors.gray[700],
    
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[300],
      tertiary: colors.gray[400],
      inverse: colors.gray[900],
    },
    
    border: {
      default: colors.gray[700],
      subtle: colors.gray[800],
      strong: colors.gray[600],
    },
    
    primary: colors.primary[500],
    primaryVariant: colors.primary[600],
    
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
    
    hashrate: colors.hashrate,
    thermal: colors.thermal,
    battery: colors.battery,
  },
  spacing,
  typography,
  borderRadius,
} as const;

// Light theme (secondary theme)
export const lightTheme = {
  colors: {
    background: colors.gray[50],
    surface: 'white',
    surfaceVariant: colors.gray[100],
    
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[500],
      inverse: 'white',
    },
    
    border: {
      default: colors.gray[200],
      subtle: colors.gray[100],
      strong: colors.gray[300],
    },
    
    primary: colors.primary[500],
    primaryVariant: colors.primary[600],
    
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
    
    hashrate: colors.hashrate,
    thermal: colors.thermal,
    battery: colors.battery,
  },
  spacing,
  typography,
  borderRadius,
} as const;

// Export the default (dark) theme and tokens
export const tokens = darkTheme;
export type Theme = typeof darkTheme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;