import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { zIndexScale } from '../assets/themes/definitions/zIndex';

declare module '@mui/material/styles' {
  interface PaletteColor {
    mainChannel?: string;
  }
}

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={(theme: Theme) => ({
        'html': {
          scrollbarGutter: 'stable',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          boxSizing: 'border-box',
        },
        '*, *::before, *::after': {
          boxSizing: 'inherit',
        },
        'body': {
          margin: 0,
          padding: 0,
          scrollbarGutter: 'stable',
        },
        '.glass-effect': {
          backdropFilter: 'blur(24px) saturate(200%) !important',
          WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
          backgroundColor:
            theme.palette.mode === 'light'
              ? `${alpha('#ffffff', 0.7)} !important`
              : `${alpha('#ffffff', 0.02)} !important`,
          backgroundImage: 'none !important',
          border: `1px solid ${theme.palette.mode === 'light' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.08)
            } !important`,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 32px 0 rgba(31, 38, 135, 0.15) !important'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.5) !important',
        },
        '.liquid-glass-effect': {
          backdropFilter: 'blur(24px) saturate(180%) !important',
          WebkitBackdropFilter: 'blur(24px) saturate(180%) !important',
          backgroundColor:
            theme.palette.mode === 'light'
              ? `${alpha('#ffffff', 0.82)} !important`
              : `${alpha('#17171F', 0.75)} !important`,
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.12)'
            } !important`,
          boxShadow:
            theme.palette.mode === 'light'
              ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.06), 0 12px 36px 0 rgba(31, 38, 135, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.04) !important'
              : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.35), 0 12px 36px 0 rgba(0, 0, 0, 0.6), 0 2px 8px 0 rgba(0, 0, 0, 0.4) !important',
        },
        '@keyframes scaleIn': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        '@keyframes slideInRight': {
          '0%': { transform: 'translateX(-10px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        '@keyframes pulseGlow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(16, 185, 129, 0.35)' },
          '50%': { boxShadow: '0 0 24px rgba(16, 185, 129, 0.65)' },
        },
        '.animate-scale-in': {
          animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.animate-slide-in': {
          animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.state-loading-shimmer': {
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--state-loading-skeleton-base, var(--surface-subtle, #1E1E28))',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            transform: 'translateX(-100%)',
            backgroundImage:
              'linear-gradient(90deg, transparent, var(--state-loading-skeleton-highlight, var(--surface-paper, #17171F)), transparent)',
            animation: 'shimmer var(--state-loading-shimmer-duration, 1.5s ease-in-out infinite)',
          },
        },
        '.state-success-glow': {
          animation: 'pulseGlow 2s ease-in-out infinite',
          border: '1px solid rgba(16, 185, 129, 0.5) !important',
        },
        '.state-error-inline': {
          backgroundColor: 'rgba(239, 68, 68, 0.08) !important',
          border: '1px solid rgba(239, 68, 68, 0.25) !important',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '8px 12px',
        },
        '.touch-target-accessible': {
          minInlineSize: 'var(--touch-target-min, 44px)',
          minBlockSize: 'var(--touch-target-min, 44px)',
        },
        '.action-lock-transition': {
          transition: 'all var(--motion-duration-quick, 120ms) var(--motion-easing-standard, cubic-bezier(0.4, 0.0, 0.2, 1)) !important',
        },
        '.action-lock-active': {
          pointerEvents: 'none !important',
          opacity: '0.7 !important',
          cursor: 'wait !important',
        },
        '.state-empty-container': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--state-empty-dashed-border, 1px dashed var(--surface-border))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: 'var(--space-8, 32px) var(--space-6, 24px)',
          textAlign: 'center',
        },
        '.premium-menu-item': {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%) !important`,
            transform: `translateX(${theme.spacing(0.5)})`,
            '& .tabler-icon, & i': {
              transform: 'scale(1.1)',
              color: theme.palette.primary.main + ' !important',
            },
          },
        },
        '.premium-auth-container': {
          '& .MuiButton-contained': {
            backdropFilter: 'blur(12px) saturate(150%) !important',
            WebkitBackdropFilter: 'blur(12px) saturate(150%) !important',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.08) !important',
            border: `1px solid ${theme.palette.mode === 'light' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.08)
              } !important`,
            transition: 'all 0.2s ease-in-out !important',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15) !important',
            },
          },
          '& .MuiButton-containedPrimary': {
            background: `rgba(${theme.palette.primary.mainChannel || '212 175 55'} / 0.15) !important`,
            color: theme.palette.primary.main + ' !important',
            '&:hover': {
              background: `rgba(${theme.palette.primary.mainChannel || '212 175 55'} / 0.25) !important`,
            },
          },
          '& .MuiButton-containedInfo': {
            background: `rgba(${theme.palette.info.mainChannel || '47 79 79'} / 0.15) !important`,
            color: theme.palette.info.main + ' !important',
            '&:hover': {
              background: `rgba(${theme.palette.info.mainChannel || '47 79 79'} / 0.25) !important`,
            },
          },
          '& .MuiButton-containedError': {
            background: `rgba(${theme.palette.error.mainChannel || '220 53 69'} / 0.15) !important`,
            color: theme.palette.error.main + ' !important',
            '&:hover': {
              background: `rgba(${theme.palette.error.mainChannel || '220 53 69'} / 0.25) !important`,
            },
          },
          '& .MuiButton-containedSuccess': {
            background: `rgba(${theme.palette.success.mainChannel || '40 167 69'} / 0.15) !important`,
            color: theme.palette.success.main + ' !important',
            '&:hover': {
              background: `rgba(${theme.palette.success.mainChannel || '40 167 69'} / 0.25) !important`,
            },
          },
        },
      })}
    />
  );
};

export const GlobalZIndexStyles = () => {
  return (
    <MuiGlobalStyles
      styles={() => ({
        ':root': {
          // Z-Index variables
          '--z-behind': zIndexScale.local.behind,
          '--z-base': zIndexScale.local.base,
          '--z-above': zIndexScale.local.above,
          '--z-highlight': zIndexScale.local.highlight,
          '--z-overlay': zIndexScale.local.overlay,
          '--header-z-index': zIndexScale.layout.header,
          '--footer-z-index': zIndexScale.layout.footer,
          '--drawer-z-index': zIndexScale.layout.navigation,
          '--backdrop-z-index': zIndexScale.layout.backdrop,
          '--modal-z-index': zIndexScale.layout.modal,
        },
      })}
    />
  );
};

export default GlobalStyles;
