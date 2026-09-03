import { styled } from '@mui/material/styles';
import React, { ReactNode, CSSProperties } from 'react';
import {
  resolveComponentCustomProperties,
  resolveOrganicThemeStyles,
} from '../utils/themeObjectStyles';

export interface OrganicCardProps {
  children: ReactNode;
  curvature?: number;
  fluidity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

const getOrganicRadius = (curvature: number) =>
  curvature > 50 ? `${curvature}% ${100 - curvature}%` : `${curvature}px`;

const StyledOrganicCard = styled('div')<Omit<OrganicCardProps, 'children'>>(
  ({ theme, curvature, fluidity, backgroundColor, borderColor, borderWidth, padding }) => {
    const organicStyles = resolveOrganicThemeStyles(theme);
    const resolvedCurvature = curvature ?? theme.tenantTheme?.effects.organic?.curvature ?? 80;
    const resolvedFluidity = fluidity ?? theme.tenantTheme?.effects.organic?.fluidity ?? 50;

    return {
      borderRadius: getOrganicRadius(resolvedCurvature),
      background: backgroundColor || organicStyles.background,
      border: `${borderWidth || theme.tenantTheme?.effects.organic?.borderWidth || '0px'} solid ${
        borderColor || theme.tenantTheme?.effects.organic?.borderColor || 'transparent'
      }`,
      padding: padding || theme.spacing(4),
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      filter: resolvedFluidity > 0 ? `blur(${resolvedFluidity / 50}px)` : 'none',
      ...resolveComponentCustomProperties(theme, 'card'),
      '&:hover': {
        transform: 'scale(1.02) rotate(1deg)',
        borderRadius: getOrganicRadius(Math.max(resolvedCurvature - 10, 0)),
      },
    };
  },
);

export const OrganicCard: React.FC<OrganicCardProps> = ({ children, ...props }) => {
  return <StyledOrganicCard {...props}>{children}</StyledOrganicCard>;
};

export default OrganicCard;
