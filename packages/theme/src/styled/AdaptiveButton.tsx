import React from 'react';
import { styled, alpha, darken } from '@mui/material/styles';
import { GlassButton } from './GlassButton';
import { NeuButton } from './NeuButton';
import { BrutalismButton } from './BrutalismButton';
import { BentoButton } from './BentoButton';
import { OrganicButton } from './OrganicButton';
import { ImmersiveButton } from './ImmersiveButton';
import type { ComponentEffectStyle, EffectType } from '../types';
import { useComponentEffectConfig } from '../hooks/useComponentEffectConfig';
import {
  getThemeFocusRing,
  resolveComponentCustomProperties,
} from '../utils/themeObjectStyles';

export interface AdaptiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  effectStyle?: ComponentEffectStyle;
  globalEffectType?: EffectType;
  glassConfig?: React.ComponentProps<typeof GlassButton>;
  neuConfig?: React.ComponentProps<typeof NeuButton>;
  brutalismConfig?: React.ComponentProps<typeof BrutalismButton>;
  bentoConfig?: React.ComponentProps<typeof BentoButton>;
  organicConfig?: React.ComponentProps<typeof OrganicButton>;
  immersiveConfig?: React.ComponentProps<typeof ImmersiveButton>;
  variant?: 'primary' | 'secondary' | 'outline' | 'flat';
}

const StandardButton = styled('button')<{
  variant?: AdaptiveButtonProps['variant'];
  className?: string;
  style?: React.CSSProperties;
}>(({ theme, variant }) => {
  const customStyles = resolveComponentCustomProperties(theme, 'button');

  const variantStyles = (() => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: 'none',
          boxShadow: (typeof theme.customShadows?.primary === 'object' ? theme.customShadows?.primary?.sm : theme.customShadows?.primary) || theme.shadows[2],
          '&:hover:not(:disabled)': {
            background: theme.palette.primary.dark || darken(theme.palette.primary.main, 0.12),
            transform: 'translateY(-1px)',
          },
        };
      case 'secondary':
        return {
          background: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          border: 'none',
          boxShadow: (typeof theme.customShadows?.secondary === 'object' ? theme.customShadows?.secondary?.sm : theme.customShadows?.secondary) || theme.shadows[2],
          '&:hover:not(:disabled)': {
            background: theme.palette.secondary.dark || darken(theme.palette.secondary.main, 0.12),
            transform: 'translateY(-1px)',
          },
        };
      case 'outline':
        return {
          background: 'transparent',
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.main}`,
          '&:hover:not(:disabled)': {
            background: alpha(theme.palette.primary.main, 0.08),
          },
        };
      default:
        return {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover:not(:disabled)': {
            background: theme.palette.background.default,
            borderColor: theme.palette.primary.main,
          },
        };
    }
  })();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1.25, 2.5),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    margin: 0,
    boxShadow: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    ...variantStyles,
    ...customStyles,
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&:active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: getThemeFocusRing(theme),
    },
  };
});

export const AdaptiveButton: React.FC<AdaptiveButtonProps> = ({
  children,
  effectStyle = 'global',
  globalEffectType,
  glassConfig,
  neuConfig,
  brutalismConfig,
  bentoConfig,
  organicConfig,
  immersiveConfig,
  variant = 'primary',
  className,
  style,
  ...props
}) => {
  const effectConfig = useComponentEffectConfig('button');
  const activeGlobalType = globalEffectType || effectConfig.globalType;

  const getActiveStyle = (): ComponentEffectStyle => {
    if (effectStyle === 'global') {
      return activeGlobalType;
    }
    return effectStyle as EffectType;
  };

  const activeStyle = getActiveStyle();

  switch (activeStyle) {
    case 'glass':
      return <GlassButton variant={variant as any} {...glassConfig} className={className} style={style} {...props}>{children}</GlassButton>;
    case 'neu':
      return <NeuButton variant={variant as any} {...neuConfig} className={className} style={style} {...props}>{children}</NeuButton>;
    case 'brutalism':
      return <BrutalismButton {...brutalismConfig} className={className} style={style} {...props}>{children}</BrutalismButton>;
    case 'bento':
      return <BentoButton {...bentoConfig} className={className} style={style} {...props}>{children}</BentoButton>;
    case 'organic':
      return <OrganicButton {...organicConfig} className={className} style={style} {...props}>{children}</OrganicButton>;
    case 'immersive':
      return <ImmersiveButton {...immersiveConfig} className={className} style={style} {...props}>{children}</ImmersiveButton>;
    default:
      return (
        <StandardButton
          variant={variant}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </StandardButton>
      );
  }
};

export default AdaptiveButton;
