import { useMemo } from 'react';
import { useTenantThemeContext } from '../context/TenantThemeContext';
import type { ComponentStyleConfig, ComponentStyles } from '../types/componentStyles';

export const useComponentStyle = (componentName: keyof ComponentStyles): ComponentStyleConfig | null => {
  const { theme } = useTenantThemeContext();

  return useMemo(() => {
    if (!theme?.components) return null;
    return theme.components[componentName] || null;
  }, [theme, componentName]);
};
