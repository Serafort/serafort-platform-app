import type { Theme } from '@mui/material/styles'

export type SystemMode = 'light' | 'dark'

export const themeShadows = (mode: SystemMode): Theme['shadows'] => {
  const [r, g, b] = mode === 'light' ? [47, 43, 61] : [19, 17, 32]
  const c = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`
  return [
    'none',
    `0px 2px 1px -1px ${c(0.2)},0px 1px 1px 0px ${c(0.14)},0px 1px 3px 0px ${c(0.12)}`,
    `0px 3px 1px -2px ${c(0.2)},0px 2px 2px 0px ${c(0.14)},0px 1px 5px 0px ${c(0.12)}`,
    `0px 3px 3px -2px ${c(0.2)},0px 3px 4px 0px ${c(0.14)},0px 1px 8px 0px ${c(0.12)}`,
    `0px 2px 4px -1px ${c(0.2)},0px 4px 5px 0px ${c(0.14)},0px 1px 10px 0px ${c(0.12)}`,
    `0px 3px 5px -1px ${c(0.2)},0px 5px 8px 0px ${c(0.14)},0px 1px 14px 0px ${c(0.12)}`,
    `0px 3px 5px -1px ${c(0.2)},0px 6px 10px 0px ${c(0.14)},0px 1px 18px 0px ${c(0.12)}`,
    `0px 4px 5px -2px ${c(0.2)},0px 7px 10px 1px ${c(0.14)},0px 2px 16px 1px ${c(0.12)}`,
    `0px 5px 5px -3px ${c(0.2)},0px 8px 10px 1px ${c(0.14)},0px 3px 14px 2px ${c(0.12)}`,
    `0px 5px 6px -3px ${c(0.2)},0px 9px 12px 1px ${c(0.14)},0px 3px 16px 2px ${c(0.12)}`,
    `0px 6px 6px -3px ${c(0.2)},0px 10px 14px 1px ${c(0.14)},0px 4px 18px 3px ${c(0.12)}`,
    `0px 6px 7px -4px ${c(0.2)},0px 11px 15px 1px ${c(0.14)},0px 4px 20px 3px ${c(0.12)}`,
    `0px 7px 8px -4px ${c(0.2)},0px 12px 17px 2px ${c(0.14)},0px 5px 22px 4px ${c(0.12)}`,
    `0px 7px 8px -4px ${c(0.2)},0px 13px 19px 2px ${c(0.14)},0px 5px 24px 4px ${c(0.12)}`,
    `0px 7px 9px -4px ${c(0.2)},0px 14px 21px 2px ${c(0.14)},0px 5px 26px 4px ${c(0.12)}`,
    `0px 8px 9px -5px ${c(0.2)},0px 15px 22px 2px ${c(0.14)},0px 6px 28px 5px ${c(0.12)}`,
    `0px 8px 10px -5px ${c(0.2)},0px 16px 24px 2px ${c(0.14)},0px 6px 30px 5px ${c(0.12)}`,
    `0px 8px 11px -5px ${c(0.2)},0px 17px 26px 2px ${c(0.14)},0px 6px 32px 5px ${c(0.12)}`,
    `0px 9px 11px -5px ${c(0.2)},0px 18px 28px 2px ${c(0.14)},0px 7px 34px 6px ${c(0.12)}`,
    `0px 9px 12px -6px ${c(0.2)},0px 19px 29px 2px ${c(0.14)},0px 7px 36px 6px ${c(0.12)}`,
    `0px 10px 13px -6px ${c(0.2)},0px 20px 31px 3px ${c(0.14)},0px 8px 38px 7px ${c(0.12)}`,
    `0px 10px 13px -6px ${c(0.2)},0px 21px 33px 3px ${c(0.14)},0px 8px 40px 7px ${c(0.12)}`,
    `0px 10px 14px -6px ${c(0.2)},0px 22px 35px 3px ${c(0.14)},0px 8px 42px 7px ${c(0.12)}`,
    `0px 11px 14px -7px ${c(0.2)},0px 23px 36px 3px ${c(0.14)},0px 9px 44px 8px ${c(0.12)}`,
    `0px 11px 15px -7px ${c(0.2)},0px 24px 38px 3px ${c(0.14)},0px 9px 46px 8px ${c(0.12)}`,
  ]
}

export const themeCustomShadows = (mode: SystemMode): Theme['customShadows'] => {
  const shadowOpacity = {
    xs: mode === 'light' ? 0.1 : 0.16,
    sm: mode === 'light' ? 0.12 : 0.18,
    md: mode === 'light' ? 0.14 : 0.2,
    lg: mode === 'light' ? 0.16 : 0.22,
    xl: mode === 'light' ? 0.18 : 0.24,
  }
  const [r, g, b] = mode === 'light' ? [47, 43, 61] : [19, 17, 32]
  return {
    xs: `0px 1px 6px rgba(${r}, ${g}, ${b}, ${shadowOpacity.xs})`,
    sm: `0px 2px 8px rgba(${r}, ${g}, ${b}, ${shadowOpacity.sm})`,
    md: `0px 3px 12px rgba(${r}, ${g}, ${b}, ${shadowOpacity.md})`,
    lg: `0px 4px 18px rgba(${r}, ${g}, ${b}, ${shadowOpacity.lg})`,
    xl: `0px 5px 30px rgba(${r}, ${g}, ${b}, ${shadowOpacity.xl})`,
    primary: {
      sm: 'rgba(115, 103, 240, 0.3) 0px 2px 6px',
      md: 'rgba(115, 103, 240, 0.4) 0px 4px 16px',
      lg: 'rgba(115, 103, 240, 0.5) 0px 6px 20px',
    },
    secondary: {
      sm: 'rgba(128, 131, 144, 0.3) 0px 2px 6px',
      md: 'rgba(128, 131, 144, 0.4) 0px 4px 16px',
      lg: 'rgba(128, 131, 144, 0.5) 0px 6px 20px',
    },
    error: {
      sm: 'rgba(255, 76, 81, 0.3) 0px 2px 6px',
      md: 'rgba(255, 76, 81, 0.4) 0px 4px 16px',
      lg: 'rgba(255, 76, 81, 0.5) 0px 6px 20px',
    },
    warning: {
      sm: 'rgba(255, 159, 67, 0.3) 0px 2px 6px',
      md: 'rgba(255, 159, 67, 0.4) 0px 4px 16px',
      lg: 'rgba(255, 159, 67, 0.5) 0px 6px 20px',
    },
    info: {
      sm: 'rgba(0, 186, 209, 0.3) 0px 2px 6px',
      md: 'rgba(0, 186, 209, 0.4) 0px 4px 16px',
      lg: 'rgba(0, 186, 209, 0.5) 0px 6px 20px',
    },
    success: {
      sm: 'rgba(40, 199, 111, 0.3) 0px 2px 6px',
      md: 'rgba(40, 199, 111, 0.4) 0px 4px 16px',
      lg: 'rgba(40, 199, 111, 0.5) 0px 6px 20px',
    },
  }
}
