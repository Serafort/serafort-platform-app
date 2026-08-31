import { useMemo } from "react";
import { useTenantThemeContext } from "../context/TenantThemeContext";
import { DEFAULT_EFFECT_CONFIG } from "../types/effects";
import type { EffectConfig, EffectType } from "../types/effects";
import type { ComponentStyles } from "../types/componentStyles";

export const useComponentEffectConfig = (
  componentName?: keyof ComponentStyles,
): EffectConfig => {
  const { theme } = useTenantThemeContext();

  return useMemo(() => {
    const config = { ...(theme?.effects || DEFAULT_EFFECT_CONFIG) };

    if (componentName && theme?.components?.[componentName]) {
      const componentStyle = theme.components[componentName].style;
      if (componentStyle !== "global") {
        config.globalType = componentStyle as EffectType;
      }
    }

    return config;
  }, [theme, componentName]);
};
