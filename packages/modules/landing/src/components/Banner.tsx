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
  title: 'LinkedIn Job Scraper & Analysis Platform',
  description:
    'Discover job opportunities effortlessly with our powerful job scraping and analysis tools. Search, scrape, and analyze LinkedIn job postings with advanced filtering and real-time statistics.',
  image: Banner2,
  imageText: 'Job Search and Analysis Platform',
  linkText: 'Start Exploring Jobs',
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
      {/* Preload background image for better performance */}
      <img style={{ display: 'none' }} src={bannerContent.image} alt={bannerContent.imageText} />

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
