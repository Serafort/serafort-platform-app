import { styled } from '@mui/material/styles';
import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  resolveComponentCustomProperties,
  resolveOrganicThemeStyles,
} from '../utils/themeObjectStyles';

export interface OrganicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  curvature?: number;
  fluidity?: number;
  backgroundColor?: string;
  borderColor?: string;
  padding?: string;
}

const getOrganicRadius = (curvature: number) =>
  curvature > 50 ? `${curvature}% ${100 - curvature}%` : `${curvature}px`;

const StyledOrganicButton = styled('button')<Omit<OrganicButtonProps, 'children'>>(
  ({ theme, curvature, fluidity, backgroundColor, borderColor, padding }) => {
    const organicStyles = resolveOrganicThemeStyles(theme);
    const resolvedCurvature = curvature ?? theme.tenantTheme?.effects.organic?.curvature ?? 80;
    const resolvedFluidity = fluidity ?? theme.tenantTheme?.effects.organic?.fluidity ?? 50;

    return {
      borderRadius: getOrganicRadius(resolvedCurvature),
      background: backgroundColor || organicStyles.background || theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      border: `1px solid ${borderColor || theme.tenantTheme?.effects.organic?.borderColor || 'transparent'}`,
      padding: padding || theme.spacing(1.5, 3.5),
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      filter: resolvedFluidity > 0 ? `blur(${resolvedFluidity / 60}px)` : 'none',
      ...resolveComponentCustomProperties(theme, 'button'),
      '&:hover': {
        transform: 'scale(1.05) rotate(-1deg)',
        borderRadius: getOrganicRadius(Math.max(resolvedCurvature - 10, 0)),
        boxShadow: (typeof theme.customShadows?.primary === 'object' ? theme.customShadows?.primary?.md : theme.customShadows?.primary) || theme.shadows[4],
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    };
  },
);

export const OrganicButton: React.FC<OrganicButtonProps> = ({ children, ...props }) => {
  return <StyledOrganicButton {...props}>{children}</StyledOrganicButton>;
};

export default OrganicButton;
