import React from 'react'
import * as icons from '@mui/icons-material'
import { SxProps } from '@mui/material'

const Icon: React.FC<{
  icon: string
  sx?: SxProps
}> = ({ icon, sx }) => {
  const IconComponent = icons[icon as keyof typeof icons]
  return IconComponent ? <IconComponent sx={sx} /> : null
}

export default Icon
