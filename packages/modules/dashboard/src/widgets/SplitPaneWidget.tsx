import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Box, IconButton, Tooltip, Stack } from '@mui/material'
import { ViewColumn, ViewStream, ViewArray } from '@mui/icons-material'
import { WidgetCanvas } from '@cap/theme'
import { useLayoutEngineContext } from '@cap/platform-core'
import type { GridLayout } from '@cap/shared-types'
import { DASHBOARD_WIDGET_IDS } from './widgetIds'

const LEFT_DEFAULT_LAYOUT: GridLayout = {
  slots: ['split-left-slot-1', 'split-left-slot-2', 'split-left-slot-3'],
  slotWidgets: {
    'split-left-slot-1': DASHBOARD_WIDGET_IDS.revenueChart,
    'split-left-slot-2': DASHBOARD_WIDGET_IDS.recentOrders,
    'split-left-slot-3': DASHBOARD_WIDGET_IDS.weather,
  },
  slotSizes: {
    'split-left-slot-1': { span: 4, height: 280 },
    'split-left-slot-2': { span: 4, height: 280 },
    'split-left-slot-3': { span: 4, height: 280 },
  },
}

const RIGHT_DEFAULT_LAYOUT: GridLayout = {
  slots: ['split-right-slot-1', 'split-right-slot-2', 'split-right-slot-3'],
  slotWidgets: {
    'split-right-slot-1': DASHBOARD_WIDGET_IDS.revenueChart,
  },
  slotSizes: {
    'split-right-slot-1': { span: 12, height: 200 },
    'split-right-slot-2': { span: 12, height: 200 },
    'split-right-slot-3': { span: 12, height: 200 },
  },
}

export interface SplitPaneWidgetProps {
  subLayout?: GridLayout
}

export const SplitPaneWidget: React.FC<SplitPaneWidgetProps> = () => {
  const { isCustomMode } = useLayoutEngineContext()
  const mode = isCustomMode ? 'custom' : 'classic'
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      }}
    >
      <CardHeader
        avatar={<ViewArray color="primary" fontSize="small" />}
        title="Split Pane Canvas"
        titleTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
        action={
          <Tooltip title={orientation === 'horizontal' ? 'Switch to Vertical Split' : 'Switch to Horizontal Split'}>
            <IconButton size="small" onClick={toggleOrientation}>
              {orientation === 'horizontal' ? <ViewColumn fontSize="small" /> : <ViewStream fontSize="small" />}
            </IconButton>
          </Tooltip>
        }
        sx={{ pb: 1, pt: 1.5, px: 2 }}
      />
      <CardContent sx={{ flex: 1, p: 1.5, pt: 0, overflow: 'auto' }}>
        <Stack
          direction={orientation === 'horizontal' ? 'row' : 'column'}
          spacing={1.5}
          sx={{ height: '100%', minHeight: 200 }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              p: 1,
              borderRadius: 2,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'),
              border: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <WidgetCanvas
              layoutId="split-left-pane"
              mode={mode}
              defaultLayout={LEFT_DEFAULT_LAYOUT}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              p: 1,
              borderRadius: 2,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'),
              border: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <WidgetCanvas
              layoutId="split-right-pane"
              mode={mode}
              defaultLayout={RIGHT_DEFAULT_LAYOUT}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SplitPaneWidget
