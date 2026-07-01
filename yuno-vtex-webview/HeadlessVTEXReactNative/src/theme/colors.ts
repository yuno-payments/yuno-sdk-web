/**
 * Yuno Official Color Palette
 * Matches Yuno's native SDK design system
 */

export interface ColorPalette {
  // Neutral colors (black/white that swap in dark mode)
  neutralB: string;
  neutralW: string;
  
  // Grey scale (0-5, lightest to darkest)
  grey0: string;
  grey1: string;
  grey2: string;
  grey3: string;
  grey4: string;
  grey5: string;
  
  // Primary colors
  primary1: string;
  primary2: string;
  primary3: string;
  primary4: string;
  primary5: string;
  
  // Secondary colors
  secondary1: string;
  secondary2: string;
  secondary3: string;
  secondary4: string;
  secondary5: string;
  secondary6: string;
  
  // Tertiary colors
  tertiary1: string;
  tertiary2: string;
  tertiary3: string;
  tertiary4: string;
  
  // Semantic mappings (for easier usage)
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderLight: string;
  card: string;
  cardBorder: string;
  elevation: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  disabled: string;
  disabledText: string;
  
  // Header specific (static colors, no auto-inversion)
  headerBackground: string;
  headerText: string;
}

/**
 * Light Mode - Yuno Official Palette
 */
export const lightColors: ColorPalette = {
  // Neutral
  neutralB: '#282A30',
  neutralW: '#FFFFFF',
  
  // Grey Scale
  grey0: '#FCFCFF',
  grey1: '#F6F7FA',
  grey2: '#ECEFF2',
  grey3: '#BFC2C7',
  grey4: '#92959B',
  grey5: '#6C6F75',
  
  // Primary
  primary1: '#3E4FE0',
  primary2: '#29D99A',
  primary3: '#FDB600',
  primary4: '#F13F5E',
  primary5: '#086BFF',
  
  // Secondary
  secondary1: '#E3EEFF',
  secondary2: '#DEFFF3',
  secondary3: '#FFF6DB',
  secondary4: '#FFDFE3',
  secondary5: '#E9E8FF',
  secondary6: '#FEEBE1',
  
  // Tertiary
  tertiary1: '#12823B',
  tertiary2: '#E5A424',
  tertiary3: '#E02E4D',
  tertiary4: '#F6610C',
  
  // Semantic Mappings (Light Mode)
  background: '#F6F7FA',        // grey1
  surface: '#FFFFFF',           // neutralW
  surfaceVariant: '#FCFCFF',    // grey0
  text: '#282A30',              // neutralB
  textPrimary: '#282A30',       // neutralB
  textSecondary: '#6C6F75',     // grey5
  textTertiary: '#92959B',      // grey4
  textInverse: '#FFFFFF',       // neutralW (for buttons/header)
  border: '#BFC2C7',            // grey3
  borderLight: '#ECEFF2',       // grey2
  card: '#FFFFFF',              // neutralW
  cardBorder: '#BFC2C7',        // grey3
  elevation: 'rgba(0, 0, 0, 0.1)',
  success: '#29D99A',           // primary2
  error: '#F13F5E',             // primary4
  warning: '#FDB600',           // primary3
  info: '#086BFF',              // primary5
  disabled: '#BFC2C7',          // grey3
  disabledText: '#92959B',      // grey4
  
  // Header (Light Mode: white bg, black text)
  headerBackground: '#FFFFFF',  // neutralW
  headerText: '#282A30',        // neutralB
};

/**
 * Dark Mode - Yuno Official Palette
 */
export const darkColors: ColorPalette = {
  // Neutral (swapped)
  neutralB: '#FFFFFF',
  neutralW: '#1F2023',
  
  // Grey Scale (Dark)
  grey0: '#1F2023',
  grey1: '#2E2F36',
  grey2: '#35363E',
  grey3: '#797E85',
  grey4: '#9CA0A6',
  grey5: '#BFC2C7',
  
  // Primary (same as light)
  primary1: '#3E4FE0',
  primary2: '#29D99A',
  primary3: '#FDB600',
  primary4: '#F13F5E',
  primary5: '#086BFF',
  
  // Secondary (same as light)
  secondary1: '#E3EEFF',
  secondary2: '#DEFFF3',
  secondary3: '#FFF6DB',
  secondary4: '#FFDFE3',
  secondary5: '#E9E8FF',
  secondary6: '#FEEBE1',
  
  // Tertiary (same as light)
  tertiary1: '#12823B',
  tertiary2: '#E5A424',
  tertiary3: '#E02E4D',
  tertiary4: '#F6610C',
  
  // Semantic Mappings (Dark Mode)
  background: '#2E2F36',        // grey1
  surface: '#1F2023',           // neutralW (dark)
  surfaceVariant: '#1F2023',    // grey0
  text: '#FFFFFF',              // neutralB (dark - inverted)
  textPrimary: '#FFFFFF',       // neutralB (dark - inverted)
  textSecondary: '#BFC2C7',     // grey5
  textTertiary: '#9CA0A6',      // grey4
  textInverse: '#1F2023',       // neutralW (for buttons/header)
  border: '#797E85',            // grey3
  borderLight: '#35363E',       // grey2
  card: '#1F2023',              // neutralW (dark)
  cardBorder: '#797E85',        // grey3
  elevation: 'rgba(0, 0, 0, 0.3)',
  success: '#29D99A',           // primary2
  error: '#F13F5E',             // primary4
  warning: '#FDB600',           // primary3
  info: '#086BFF',              // primary5
  disabled: '#797E85',          // grey3
  disabledText: '#9CA0A6',      // grey4
  
  // Header (Dark Mode: black bg, white text)
  headerBackground: '#282A30',  // neutralB (original from light)
  headerText: '#FFFFFF',        // neutralB (inverted)
};

/**
 * Legacy colors object for backward compatibility
 * @deprecated Use useTheme() hook instead
 */
export const colors = lightColors;

export type ColorName = keyof ColorPalette;
