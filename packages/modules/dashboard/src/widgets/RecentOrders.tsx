import React from 'react'
import { Box, Chip, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface OrderRow {
  id: string
  customer: string
  amount: string
  status: 'paid' | 'pending' | 'refunded'
}

const recentOrders: OrderRow[] = [
  { id: '#ORD-1042', customer: 'Acme Corp', amount: '$1,240.00', status: 'paid' },
  { id: '#ORD-1041', customer: 'Globex Inc', amount: '$890.50', status: 'pending' },
  { id: '#ORD-1040', customer: 'Initech', amount: '$2,310.00', status: 'paid' },
  { id: '#ORD-1039', customer: 'Umbrella LLC', amount: '$420.75', status: 'refunded' },
  { id: '#ORD-1038', customer: 'Stark Industries', amount: '$1,980.00', status: 'paid' },
]

const statusColor: Record<OrderRow['status'], 'success' | 'warning' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'default',
}

/**
 * Dummy widget used to exercise the widget registry and lazy-loading.
 * Renders a static list of recent orders.
 */
const RecentOrders: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 280 }}
    >
      <Box>
        <Typography variant="h6">{t('widgets.recentOrders.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('widgets.recentOrders.subtitle')}
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, mt: 1, overflow: 'auto' }} disablePadding>
        {recentOrders.map((order) => (
          <ListItem key={order.id} disableGutters sx={{ px: 0, py: 0.75 }}>
            <ListItemText
              primary={`${order.customer} · ${order.id}`}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {order.amount}
              </Typography>
              <Chip label={order.status} size="small" color={statusColor[order.status]} />
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default RecentOrders
