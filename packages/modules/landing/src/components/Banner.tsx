import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import Banner2 from '../assets/images/abstract_low_poly_banner_design_1301.jpg'

interface BannerPost {
  title: string
  description: string
  image: string
  imageText: string
  linkText?: string
}

const bannerContent: BannerPost = {
  title: 'The Multi-Tenant Platform Built for Scale',
  description:
    'Serafort gives every team a fully isolated workspace — branded, localised, and secured from day one. Ship confidently with role-based access, real-time dashboards, and an AI-powered widget studio.',
  image: Banner2,
  imageText: 'Serafort multi-tenant platform hero banner',
  linkText: 'Get Started',
}

const Banner: React.FC = () => {
  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(${bannerContent.image})`,
        borderRadius: 2,
      }}
    >
      {/* Dark overlay for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.5)',
          borderRadius: 2,
        }}
      />

      {/* Banner Content */}
      <Grid container>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, md: 6 },
              pr: { md: 0 },
            }}
          >
            <Typography
              component='h1'
              variant='h3'
              gutterBottom
              sx={{ fontWeight: 600, color: '#fff' }}
            >
              {bannerContent.title}
            </Typography>
            <Typography variant='h5' paragraph sx={{ color: '#fff' }}>
              {bannerContent.description}
            </Typography>
            {/* Optional: Add link/CTA button here */}
            {/* <Link variant='subtitle1' href='#'>
              {bannerContent.linkText}
            </Link> */}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Banner
