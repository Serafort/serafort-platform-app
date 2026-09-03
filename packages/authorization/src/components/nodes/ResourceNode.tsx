import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Box, Typography, Chip, Paper, alpha, useTheme } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import type { ResourceNode } from '../../types/graphTypes'

export const ResourceNodeComponent = memo(({ data, selected }: NodeProps<ResourceNode>) => {
  const theme = useTheme()
  const resourceType = data.resourceType || '*'

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 200,
        maxWidth: 260,
        p: 2,
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: selected ? 'secondary.main' : alpha(theme.palette.secondary.main, 0.25),
        bgcolor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(12px)',
        boxShadow: selected
          ? `0 0 20px ${alpha(theme.palette.secondary.main, 0.4)}`
          : `0 4px 12px ${alpha('#000', 0.1)}`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Handle
        type='target'
        position={Position.Left}
        id='resource-in'
        style={{
          width: 10,
          height: 10,
          backgroundColor: theme.palette.secondary.main,
          border: `2px solid ${theme.palette.background.paper}`,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.15),
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FolderIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
            Target Resource
          </Typography>
          <Typography variant='subtitle2' sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
            {data.label || 'Target Entity'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 11 }}>
          Type:
        </Typography>
        <Chip
          label={resourceType}
          size='small'
          color='secondary'
          variant='filled'
          sx={{ fontSize: 11, height: 22, fontWeight: 800, borderRadius: 1.5 }}
        />
      </Box>

      <Handle
        type='source'
        position={Position.Right}
        id='resource-out'
        style={{
          width: 10,
          height: 10,
          backgroundColor: theme.palette.secondary.main,
          border: `2px solid ${theme.palette.background.paper}`,
        }}
      />
    </Paper>
  )
})

ResourceNodeComponent.displayName = 'ResourceNode'
