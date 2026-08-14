import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Box, Typography, Chip, Paper, alpha, useTheme } from '@mui/material'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import type { ActionNode } from '../../types/graphTypes'

export const ActionNodeComponent = memo(({ data, selected }: NodeProps<ActionNode>) => {
  const theme = useTheme()
  const actions = data.actions || ['*']

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 200,
        maxWidth: 250,
        p: 2,
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: selected ? 'info.main' : alpha(theme.palette.info.main, 0.25),
        bgcolor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(12px)',
        boxShadow: selected
          ? `0 0 20px ${alpha(theme.palette.info.main, 0.4)}`
          : `0 4px 12px ${alpha('#000', 0.1)}`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Handle
        type='target'
        position={Position.Left}
        id='action-in'
        style={{
          width: 10,
          height: 10,
          backgroundColor: theme.palette.info.main,
          border: `2px solid ${theme.palette.background.paper}`,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.15),
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchAppIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
            Attempted Action
          </Typography>
          <Typography variant='subtitle2' sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
            {data.label || 'Operations'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {actions.map((act) => (
          <Chip
            key={act}
            label={act}
            size='small'
            color='info'
            variant='outlined'
            sx={{
              fontSize: 11,
              height: 22,
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'uppercase',
            }}
          />
        ))}
      </Box>

      <Handle
        type='source'
        position={Position.Right}
        id='action-out'
        style={{
          width: 10,
          height: 10,
          backgroundColor: theme.palette.info.main,
          border: `2px solid ${theme.palette.background.paper}`,
        }}
      />
    </Paper>
  )
})

ActionNodeComponent.displayName = 'ActionNode'
