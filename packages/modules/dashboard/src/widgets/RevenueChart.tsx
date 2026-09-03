import React from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 4200, target: 4000 },
  { month: 'Feb', revenue: 4600, target: 4100 },
  { month: 'Mar', revenue: 4300, target: 4200 },
  { month: 'Apr', revenue: 5200, target: 4400 },
  { month: 'May', revenue: 4900, target: 4600 },
  { month: 'Jun', revenue: 6100, target: 4800 },
]

/**
 * Dummy widget used to exercise the widget registry and lazy-loading.
 * Renders a responsive revenue area chart.
 */
const RevenueChart: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
      }}
    >
      <Box>
        <Typography variant="h6">{t('widgets.revenueChart.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('widgets.revenueChart.subtitle')}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 200, mt: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={200}>
          <AreaChart data={revenueData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value / 1000}k`} />
            <Tooltip
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
            />
            <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#revenueFill)" />
            <Area type="monotone" dataKey="target" stroke={theme.palette.text.disabled} strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}

export default RevenueChart
