import React from 'react'
import { Card, CardContent, Grid, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function DashboardItem({
  icon,
  children,
  title,
  color,
  backgroundColor,
}: {
  icon?: React.JSX.Element
  children: React.JSX.Element | string
  title: React.JSX.Element | string
  color?: string
  backgroundColor?: string
}) {
  const theme = useTheme()
  const effectiveColor = color || theme.palette.text.primary
  const effectiveBgColor = backgroundColor || theme.palette.background.paper
  return (
    <Card>
      <CardContent
        style={{
          backgroundColor: alpha(effectiveBgColor, 0.4),
          margin: '0px',
          padding: '0px',
        }}
      >
        <Grid container>
          {icon && (
            <Grid
              size={{ xs: 5 }}
              style={{
                backgroundColor: alpha(effectiveBgColor, 0.4),
                padding: '10px',
              }}
            >
              {icon}
            </Grid>
          )}
          <Grid
            size={{ xs: icon ? 7 : 12 }}
            style={{
              padding: '10px',
            }}
          >
            {title && (
              <Typography variant='body1' color={effectiveColor} gutterBottom>
                {title}
              </Typography>
            )}
            {children}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
