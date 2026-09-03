import React from 'react';
import { styled } from '@mui/material/styles';
import type { ComponentEffectStyle } from '../types';
import type { EffectType } from '../types';
import { useComponentEffectConfig } from '../hooks/useComponentEffectConfig';
import { computeNeumorphismBoxShadow } from '../utils/computeEffects';
import {
  getComponentCustomValue,
  getTenantThemeEffects,
  getThemeFocusRing,
  getThemeTextMuted,
  resolveComponentCustomProperties,
  resolveGlassThemeStyles,
} from '../utils/themeObjectStyles';

export interface AdaptiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  effectStyle?: ComponentEffectStyle;
  globalEffectType?: EffectType;
  label?: string;
  helperText?: string;
  error?: boolean;
}

const GlassInputWrapper = styled('div')({
  position: 'relative',
});

const GlassInput = styled('input')(({ theme }) => {
  const customStyles = resolveComponentCustomProperties(theme, 'input');
  const glassStyles = resolveGlassThemeStyles(theme);

  return {
    width: '100%',
    padding: theme.spacing(1.25, 2),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    margin: 0,
    background: glassStyles.background,
    backdropFilter: glassStyles.backdropFilter,
    WebkitBackdropFilter: glassStyles.WebkitBackdropFilter,
    border: glassStyles.border,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    ...customStyles,
    '&::placeholder': {
      color: getThemeTextMuted(theme),
    },
    '&:focus': {
      outline: 'none',
      boxShadow: getThemeFocusRing(theme),
      borderColor: theme.palette.primary.main,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
});

const NeuInputWrapper = styled('div')({
  position: 'relative',
});

const NeuInput = styled('input')(({ theme }) => {
  const customStyles = resolveComponentCustomProperties(theme, 'input');
  const neuConfig = getTenantThemeEffects(theme).neumorphism;

  return {
    width: '100%',
    padding: theme.spacing(1.25, 2),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    margin: 0,
    background: neuConfig.backgroundColor,
    border: 'none',
    borderRadius: neuConfig.borderRadius || `${theme.shape.borderRadius}px`,
    color: theme.palette.text.primary,
    boxShadow: computeNeumorphismBoxShadow(neuConfig),
    transition: 'all 0.2s ease',
    ...customStyles,
    '&::placeholder': {
      color: getThemeTextMuted(theme),
    },
    '&:focus': {
      outline: 'none',
      boxShadow: computeNeumorphismBoxShadow(neuConfig, true),
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
});

const StandardInputWrapper = styled('div')({
  position: 'relative',
});

const StandardInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.25, 2),
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.fontWeightRegular,
  margin: 0,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  ...resolveComponentCustomProperties(theme, 'input'),
  '&::placeholder': {
    color: getThemeTextMuted(theme),
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: getThemeFocusRing(theme),
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: theme.palette.background.default,
  },
}));

const Label = styled('label')(({ theme }) => ({
  display: 'block',
  fontSize: getComponentCustomValue(theme, 'input', 'labelFontSize') || theme.typography.body2.fontSize,
  fontWeight: getComponentCustomValue(theme, 'input', 'labelFontWeight') || theme.typography.fontWeightMedium,
  color: theme.palette.text.primary,
  marginBottom: getComponentCustomValue(theme, 'input', 'labelMarginBottom') || theme.spacing(1),
}));

const HelperText = styled('span')(({ theme }) => ({
  display: 'block',
  fontSize: getComponentCustomValue(theme, 'input', 'helperFontSize') || theme.typography.caption.fontSize,
  color: getThemeTextMuted(theme),
  marginTop: getComponentCustomValue(theme, 'input', 'helperMarginTop') || theme.spacing(0.5),
}));

const ErrorText = styled('span')(({ theme }) => ({
  display: 'block',
  fontSize: getComponentCustomValue(theme, 'input', 'errorFontSize') || theme.typography.caption.fontSize,
  color: theme.palette.error.main,
  marginTop: getComponentCustomValue(theme, 'input', 'errorMarginTop') || theme.spacing(0.5),
}));

export const AdaptiveInput: React.FC<AdaptiveInputProps> = ({
  effectStyle = 'global',
  globalEffectType,
  label,
  helperText,
  error,
  className,
  style,
  ...props
}) => {
  const effectConfig = useComponentEffectConfig('input');
  const activeGlobalType = globalEffectType || effectConfig.globalType;

  const getActiveStyle = (): ComponentEffectStyle => {
    if (effectStyle === 'global') {
      return activeGlobalType;
    }
    return effectStyle as EffectType;
  };

  const activeStyle = getActiveStyle();

  const renderInput = (InputComponent: typeof StandardInput, inputStyle?: React.CSSProperties) => (
    <InputComponent
      className={className}
      style={inputStyle}
      {...props}
    />
  );

  const renderContent = () => {
    switch (activeStyle) {
      case 'glass':
        return (
          <GlassInputWrapper>
            {label && <Label>{label}</Label>}
            {renderInput(GlassInput, style)}
            {error ? (
              <ErrorText>{helperText}</ErrorText>
            ) : helperText ? (
              <HelperText>{helperText}</HelperText>
            ) : null}
          </GlassInputWrapper>
        );
      case 'neu':
        return (
          <NeuInputWrapper>
            {label && <Label>{label}</Label>}
            {renderInput(NeuInput, style)}
            {error ? (
              <ErrorText>{helperText}</ErrorText>
            ) : helperText ? (
              <HelperText>{helperText}</HelperText>
            ) : null}
          </NeuInputWrapper>
        );
      default:
        return (
          <StandardInputWrapper>
            {label && <Label>{label}</Label>}
            {renderInput(StandardInput, style)}
            {error ? (
              <ErrorText>{helperText}</ErrorText>
            ) : helperText ? (
              <HelperText>{helperText}</HelperText>
            ) : null}
          </StandardInputWrapper>
        );
    }
  };

  return renderContent();
};

export default AdaptiveInput;
