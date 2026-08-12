import React from 'react'
import { Box } from '@mui/material'
import Banner from '../components/Banner'

export const HeroBannerWidget: React.FC = () => {
  return (
    <Box sx={{ mb: 8 }}>
      <Banner />
    </Box>
  )
}

export default HeroBannerWidget
