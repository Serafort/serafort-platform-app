import styled from '@emotion/styled';
import { computeNeumorphismBoxShadow } from '../utils/computeEffects';
import type { NeumorphismConfig } from '../types';
import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react';
import { useComponentEffectConfig } from '../hooks/useComponentEffectConfig';

export interface NeuButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children: ReactNode;
  config?: NeumorphismConfig;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
  style?: CSSProperties;
  variant?: 'primary' | 'secondary' | 'flat';
}

const getBackground = (variant: NeuButtonProps['variant'], backgroundColor?: string) => {
  if (backgroundColor) return backgroundColor;

  switch (variant) {
    case 'primary':
      return '#6366f1';
    case 'secondary':
      return '#8b5cf6';
    case 'flat':
      return '#e0e5ec';
    default:
      return '#e0e5ec';
  }
};

const getColor = (variant: NeuButtonProps['variant'], color?: string) => {
  if (color) return color;

  switch (variant) {
    case 'primary':
    case 'secondary':
      return '#ffffff';
    default:
      return '#374151';
  }
};

const StyledNeuButton = styled.button<Omit<NeuButtonProps, 'children'>>`
  background: ${({ variant, backgroundColor,  }) =>
    getBackground(variant, backgroundColor)};
  color: ${({ variant, color }) => getColor(variant, color)};
  border-radius: ${({ borderRadius, config }) =>
    config?.borderRadius || borderRadius || '8px'};
  padding: ${({ padding }) => padding || '0.625rem 1.25rem'};
  font-size: ${({ fontSize }) => fontSize || '0.875rem'};
  font-weight: ${({ fontWeight }) => fontWeight || 500};
  border: none;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: ${({ config }) =>
    computeNeumorphismBoxShadow(config || {
      enabled: true,
      backgroundColor: '#e0e5ec',
      intensity: 0.15,
      distance: 5,
      altitude: 10,
      borderRadius: '8px',
    })};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${({ config }) =>
      computeNeumorphismBoxShadow({
        ...(config || {
          enabled: true,
          backgroundColor: '#e0e5ec',
          intensity: 0.15,
          distance: 5,
          altitude: 10,
          borderRadius: '8px',
        }),
        distance: ((config?.distance || 5) + 1),
      })};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${({ config }) =>
      computeNeumorphismBoxShadow({
        ...(config || {
          enabled: true,
          backgroundColor: '#e0e5ec',
          intensity: 0.15,
          distance: 5,
          altitude: 10,
          borderRadius: '8px',
        }),
      }, true)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

export const NeuButton: React.FC<NeuButtonProps> = ({
  children,
  config,
  ...props
}) => {
  const effectConfig = useComponentEffectConfig();
  const activeConfig = config || effectConfig.neumorphism;

  return (
    <StyledNeuButton config={activeConfig} {...props}>
      {children}
    </StyledNeuButton>
  );
};

export default NeuButton;
