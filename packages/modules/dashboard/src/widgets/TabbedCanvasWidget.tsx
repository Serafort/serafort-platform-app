import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Box, Tabs, Tab } from '@mui/material'
import TabIcon from '@mui/icons-material/Tab';
import Analytics from '@mui/icons-material/Analytics';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Cloud from '@mui/icons-material/Cloud';
import { WidgetCanvas } from '@cap/theme'
import { useLayoutEngineContext } from '@cap/platform-core'
import type { GridLayout } from '@cap/shared-types'
import { DASHBOARD_WIDGET_IDS } from './widgetIds'

const OVERVIEW_TAB_LAYOUT: GridLayout = {
  slots: ['tab-overview-slot-1', 'tab-overview-slot-2'],
  slotWidgets: {
    'tab-overview-slot-1': DASHBOARD_WIDGET_IDS.revenueChart,
    'tab-overview-slot-2': DASHBOARD_WIDGET_IDS.weather,
  },
  slotSizes: {
    'tab-overview-slot-1': { span: 8, height: 200 },
    'tab-overview-slot-2': { span: 4, height: 200 },
  },
}

const ORDERS_TAB_LAYOUT: GridLayout = {
  slots: ['tab-orders-slot-1'],
  slotWidgets: {
    'tab-orders-slot-1': DASHBOARD_WIDGET_IDS.recentOrders,
  },
  slotSizes: {
    'tab-orders-slot-1': { span: 12, height: 200 },
  },
}

export const TabbedCanvasWidget: React.FC = () => {
  const { isCustomMode } = useLayoutEngineContext()
  const mode = isCustomMode ? 'custom' : 'classic'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview')

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
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <CardHeader
        avatar={<TabIcon color="secondary" fontSize="small" />}
        title="Multi-Tab Canvas"
        titleTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
        sx={{ pb: 0, pt: 1.5, px: 2 }}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab icon={<Analytics fontSize="small" />} label="Analytics" value="overview" iconPosition="start" />
          <Tab icon={<ShoppingCart fontSize="small" />} label="Orders" value="orders" iconPosition="start" />
        </Tabs>
      </Box>
      <CardContent sx={{ flex: 1, p: 1.5, overflow: 'auto', position: 'relative' }}>
        <Box sx={{ display: activeTab === 'overview' ? 'block' : 'none', height: '100%' }}>
          <WidgetCanvas
            layoutId="tabbed-canvas-overview"
            mode={mode}
            defaultLayout={OVERVIEW_TAB_LAYOUT}
          />
        </Box>
        <Box sx={{ display: activeTab === 'orders' ? 'block' : 'none', height: '100%' }}>
          <WidgetCanvas
            layoutId="tabbed-canvas-orders"
            mode={mode}
            defaultLayout={ORDERS_TAB_LAYOUT}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default TabbedCanvasWidget
