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
        '.glass-effect': {
          backdropFilter: 'blur(24px) saturate(200%) !important',
          WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
          backgroundColor:
            theme.palette.mode === 'light'
              ? `${alpha('#ffffff', 0.7)} !important`
              : `${alpha('#ffffff', 0.02)} !important`,
          backgroundImage: 'none !important',
          border: `1px solid ${
            theme.palette.mode === 'light' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.08)
          } !important`,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 32px 0 rgba(31, 38, 135, 0.15) !important'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.5) !important',
        },
        '@keyframes scaleIn': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        '@keyframes slideInRight': {
          '0%': { transform: 'translateX(-10px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        '.animate-scale-in': {
          animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.animate-slide-in': {
          animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
            border: `1px solid ${
              theme.palette.mode === 'light' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.08)
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
