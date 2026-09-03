import React from 'react'
import { Grid, Typography } from '@mui/material'

export default function FormLayout({
  title,
  description,
  warning,
  children,
}: {
  title: string
  description: string
  warning: string
  children: React.ReactNode
}) {
  return (
    <Grid
      container
      spacing={2}
      mb='28px'
      padding='10px'
      // sx={{ backgroundColor: '#EF9A9A' }}
    >
      <Grid size={{ xs: 12, sm: 4 }}>
        <Typography
          variant='h5'
          component='h4'
          fontSize='small'
          color='#FFFFFF'
          sx={{
            lineHeight: '1.5rem',
            fontWeight: 500,
            maxWidth: '42rem',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant='h5'
          component='h4'
          fontSize='small'
          color='#EEEEEE'
          sx={{
            fontSize: '0.75rem',
            lineHeight: '1rem',
          }}
        >
          {description}
        </Typography>
        <Typography variant='h5' component='h4'>
          {warning}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>{children}</Grid>
    </Grid>
  )
}
