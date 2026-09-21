import React from 'react'
import { SvgIcon, useTheme, type SvgIconProps } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

/**
 * Wraps a glyph that encodes reading direction (arrows, chevrons) and mirrors it
 * under RTL. `stylis-plugin-rtl` rewrites physical CSS but cannot rewrite an
 * SVG path, so without this a "next" arrow keeps pointing away from the
 * reading direction in Arabic.
 */
const withRtlFlip = (Icon: typeof SvgIcon) => {
  const Flipped: React.FC<SvgIconProps> = ({ sx, ...props }) => {
    const theme = useTheme()
    return (
      <Icon
        {...props}
        sx={[
          theme.direction === 'rtl' && { transform: 'scaleX(-1)' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    )
  }
  return Flipped
}

export const BackIcon = withRtlFlip(ArrowBackIcon)
export const ForwardIcon = withRtlFlip(ArrowForwardIcon)
export const NextChevronIcon = withRtlFlip(ChevronRightIcon)
