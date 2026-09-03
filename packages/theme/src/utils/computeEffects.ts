import type { NeumorphismConfig, ComputedNeumorphismShadow } from '../types';

export const computeNeumorphismShadows = (
  config: NeumorphismConfig
): ComputedNeumorphismShadow => {
  const { intensity = 0.15, distance = 5, altitude = 10 } = config;

  const angleRad = ((360 - altitude + 90) * Math.PI) / 180;

  const x = Math.round(Math.cos(angleRad) * distance);
  const y = Math.round(Math.sin(angleRad) * distance);
  const blur = distance * 2;

  const lightShadow = `${x}px ${-y}px ${blur}px rgba(255, 255, 255, ${intensity})`;
  const darkShadow = `${-x}px ${y}px ${blur}px rgba(0, 0, 0, ${intensity * 0.4})`;

  return { lightShadow, darkShadow };
};

export const computeNeumorphismBoxShadow = (
  config: NeumorphismConfig,
  isPressed = false
): string => {
  if (!config.enabled) {
    return '0 2px 8px rgba(0, 0, 0, 0.1)';
  }

  const { lightShadow, darkShadow } = computeNeumorphismShadows(config);

  if (isPressed) {
    return `inset ${lightShadow}, inset ${darkShadow}`;
  }

  return `${lightShadow}, ${darkShadow}`;
};

import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';


export const getGlassmorphismStyles = (config: {
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
}, theme?: Theme) => {
  const {
    blur = '16px',
    background = theme ? alpha(theme.palette.background.paper, 0.4) : 'rgba(255, 255, 255, 0.1)',
    borderColor = theme ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)',
    borderWidth = '1px',
    opacity = 0.8,
  } = config;

  return {
    background: background,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`,
    border: `${borderWidth} solid ${borderColor}`,
    opacity: opacity,
  };
};

export const getBrutalismStyles = (config: {
  borderWidth?: string;
  borderColor?: string;
  shadowOffset?: string;
  shadowColor?: string;
  backgroundColor?: string;
}, theme?: Theme) => {
  const {
    borderWidth = '2px',
    borderColor = theme ? theme.palette.text.primary : '#000000',
    shadowOffset = '4px',
    shadowColor = theme ? theme.palette.text.primary : '#000000',
    backgroundColor = theme ? theme.palette.background.paper : '#ffffff',
  } = config;

  return {
    border: `${borderWidth} solid ${borderColor}`,
    boxShadow: `${shadowOffset} ${shadowOffset} 0px 0px ${shadowColor}`,
    backgroundColor: backgroundColor,
  };
};

export const getBentoStyles = (config: {
  borderRadius?: string;
  background?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: string;
}, theme?: Theme) => {
  const {
    borderRadius = '24px',
    background = theme ? theme.palette.background.paper : 'rgba(255, 255, 255, 0.8)',
    borderWidth = '1px',
    borderColor = theme ? theme.palette.divider : 'rgba(0, 0, 0, 0.05)',
    shadow = theme ? theme.shadows[4] : '0 4px 12px rgba(0, 0, 0, 0.05)',
  } = config;

  return {
    borderRadius: borderRadius,
    background: background,
    border: `${borderWidth} solid ${borderColor}`,
    boxShadow: shadow,
  };
};

export const getOrganicStyles = (config: {
  curvature?: number;
  fluidity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
}, theme?: Theme) => {
  const {
    curvature = 80,
    fluidity = 50,
    backgroundColor = theme ? theme.palette.background.paper : '#ffffff',
    borderColor = 'transparent',
    borderWidth = '0px',
  } = config;

  // Ultra-rounded, curvy, fluid look using border-radius and smooth easing
  const radius = curvature > 50 ? `${curvature}% ${100 - curvature}%` : `${curvature}px`;

  return {
    borderRadius: radius,
    background: backgroundColor,
    border: `${borderWidth} solid ${borderColor}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: fluidity > 0 ? `blur(${fluidity / 50}px)` : 'none',
  };
};

export const getImmersiveStyles = (config: {
  perspective?: string;
  rotationX?: string;
  rotationY?: string;
  depth?: number;
  shadowColor?: string;
}, theme?: Theme) => {
  const {
    perspective = '1000px',
    rotationX = '0deg',
    rotationY = '0deg',
    depth = 20,
    shadowColor = theme ? alpha(theme.palette.common.black, 0.2) : 'rgba(0,0,0,0.2)',
  } = config;

  // Deep 3D perspective and layered shadows
  return {
    perspective: perspective,
    transform: `rotateX(${rotationX}) rotateY(${rotationY})`,
    boxShadow: `
      0 ${depth / 4}px ${depth / 2}px ${shadowColor},
      0 ${depth}px ${depth * 1.5}px ${shadowColor}
    `,
    transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
  };
};

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const lightenColor = (hex: string, percent: number): string => {
  const factor = percent / 100;
  const white = '#ffffff';
  return interpolateColor(hex, white, factor);
};

export const darkenColor = (hex: string, percent: number): string => {
  const factor = percent / 100;
  const black = '#000000';
  return interpolateColor(hex, black, factor);
};
