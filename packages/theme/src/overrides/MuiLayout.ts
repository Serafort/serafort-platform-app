import { Theme } from '@mui/material/styles';

export const MuiLayoutOverrides = (_theme: Theme) => ({
  MuiList: {
    styleOverrides: {
      root: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
      },
    },
  },
  // Custom utility classes for layout that were previously in CSS modules
  MuiCssBaseline: {
    styleOverrides: {
      '.menu-ul': {
        listStyle: 'none',
        padding: 0,
        margin: 0,
      },
      '.vertical-nav-bg-image': {
        position: 'absolute' as const,
        insetBlockStart: 0,
        insetInlineStart: 0,
        inlineSize: '100%',
        blockSize: '100%',
        objectFit: 'cover' as const,
        zIndex: -1,
      },
      '.horizontal-nav-ul': {
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap' as const,
        alignItems: 'center',
        inlineSize: '100%',
        blockSize: '100%',
        overflow: 'hidden',
        position: 'relative' as const,
        padding: 0,
        margin: 0,
        '& li:not(:last-of-type)': {
          marginInlineEnd: 4,
        },
      },
    },
  },
});

export default MuiLayoutOverrides;
