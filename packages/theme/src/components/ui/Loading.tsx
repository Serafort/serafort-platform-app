import React from 'react';
import { Box, CircularProgress, Skeleton, Stack, alpha, useTheme, type SxProps, type Theme } from '@mui/material';

export interface LoadingProps {
  /**
   * Visual loading style variant
   * @default 'circular'
   */
  variant?: 'circular' | 'skeleton' | 'overlay';
  /**
   * Skeleton shape when variant is 'skeleton'
   * @default 'rounded'
   */
  skeletonShape?: 'text' | 'rectangular' | 'rounded' | 'circular';
  /**
   * Number of skeleton lines/items to render
   * @default 3
   */
  rows?: number;
  /**
   * Container or skeleton width
   */
  width?: string | number;
  /**
   * Container or skeleton height
   */
  height?: string | number;
  /**
   * Circular progress size when variant is 'circular'
   * @default 40
   */
  size?: number | string;
  /**
   * Optional loading label message
   */
  label?: string;
  /**
   * Additional MUI Sx styling overrides
   */
  sx?: SxProps<Theme>;
}

export default function Loading({
  variant = 'circular',
  skeletonShape = 'rounded',
  rows = 3,
  width = '100%',
  height,
  size = 40,
  label,
  sx,
}: LoadingProps) {
  const theme = useTheme();

  if (variant === 'skeleton') {
    return (
      <Box sx={{ width, p: 2, ...sx }}>
        <Stack spacing={1.5}>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton
              key={index}
              variant={skeletonShape}
              animation="wave"
              width={index === rows - 1 && skeletonShape === 'text' ? '60%' : '100%'}
              height={height || (skeletonShape === 'text' ? 24 : 48)}
              sx={{ borderRadius: skeletonShape === 'rounded' ? 2 : undefined }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  if (variant === 'overlay') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(4px)',
          zIndex: theme.zIndex.modal - 1,
          borderRadius: 'inherit',
          ...sx,
        }}
      >
        <CircularProgress size={size} />
        {label && (
          <Box sx={{ mt: 2, fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
            {label}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height: height || '100%',
        minHeight: typeof height === 'number' ? height : 120,
        p: 2,
        ...sx,
      }}
    >
      <CircularProgress size={size} />
      {label && (
        <Box sx={{ mt: 2, fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
          {label}
        </Box>
      )}
    </Box>
  );
}

