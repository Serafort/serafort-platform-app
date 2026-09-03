import { useTheme } from '@mui/material/styles'
import { Box, SxProps, Theme } from '@mui/material'

interface AdaptiveLogoProps {
  width?: number | string
  height?: number | string
  sx?: SxProps<Theme>
}

export default function AdaptiveLogo({ width = 80, height = 80, sx }: AdaptiveLogoProps) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <Box
      component='img'
      src='/platform_logo.svg'
      alt='Platform Logo'
      sx={{
        width,
        height,
        // Apply filter based on theme mode
        filter: isDarkMode
          ? 'brightness(1.2) contrast(0.95)' // Brighten for dark mode
          : 'brightness(0.95) contrast(1.05)', // Slightly darken for light mode
        transition: 'filter 0.3s ease-in-out',
        ...sx,
      }}
    />
  )
}
