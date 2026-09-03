import { Theme, alpha } from '@mui/material/styles';
import { computeNeumorphismBoxShadow } from '../utils/computeEffects';
import { getTenantThemeEffects } from '../utils/themeObjectStyles';

export const MuiMenuOverrides = (theme: Theme) => {
  const effects = getTenantThemeEffects(theme);
  const paperShadow = effects.neumorphism?.enabled
    ? computeNeumorphismBoxShadow(effects.neumorphism)
    : (theme.customShadows?.md || theme.shadows[8]);

  return {
    MuiMenu: {
      defaultProps: {
        elevation: 0,
        anchorOrigin: {
          vertical: 'bottom' as const,
          horizontal: 'right' as const,
        },
        transformOrigin: {
          vertical: 'top' as const,
          horizontal: 'right' as const,
        },
      },
      styleOverrides: {
        paper: {
          borderRadius: 6,
          marginTop: theme.spacing(1),
          minWidth: 180,
          color: theme.palette.text.primary,
          background: theme.palette.background.paper,
          boxShadow: paperShadow,
          '& .MuiMenu-list': {
            padding: '4px 0',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            fontSize: 18,
            color: theme.palette.text.secondary,
            marginRight: theme.spacing(1.5),
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
          },
        },
      },
    },
  };
};

export default MuiMenuOverrides;
