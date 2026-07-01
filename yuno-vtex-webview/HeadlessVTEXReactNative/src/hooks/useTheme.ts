/**
 * Hook to manage app theme (Light/Dark mode)
 * Automatically detects system theme preference
 */

import {useColorScheme} from 'react-native';
import {useMemo} from 'react';
import {lightColors, darkColors, type ColorPalette} from '../theme/colors';

export interface Theme {
  colors: ColorPalette;
  isDark: boolean;
}

/**
 * Hook that provides the current theme based on system preference
 * @returns Theme object with colors and isDark flag
 * 
 * @example
 * const {colors, isDark} = useTheme();
 * 
 * <View style={{backgroundColor: colors.background}}>
 *   <Text style={{color: colors.text}}>Hello</Text>
 * </View>
 */
export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  
  const theme = useMemo(() => {
    const isDark = colorScheme === 'dark';
    const colors = isDark ? darkColors : lightColors;
    
    return {
      colors,
      isDark,
    };
  }, [colorScheme]);
  
  return theme;
};

