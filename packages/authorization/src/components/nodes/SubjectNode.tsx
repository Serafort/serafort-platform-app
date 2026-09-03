import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Box, Typography, Chip, Stack, Paper, alpha, useTheme } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import PublicIcon from '@mui/icons-material/Public'
import BusinessIcon from '@mui/icons-material/Business'
import type { SubjectNode } from '../../types/graphTypes'
import { isPlatformRole } from '@cap/shared-types'

export const SubjectNodeComponent = memo(({ data, selected }: NodeProps<SubjectNode>) => {
  const theme = useTheme()
  const roles = data.roles || ['*']
  const permissions = data.permissions || []
  const isPlatformPlane = data.plane === 'platform' || roles.some((r) => isPlatformRole(r))

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 240,
        maxWidth: 290,
        p: 2,
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: selected
          ? isPlatformPlane
            ? 'secondary.main'
            : 'primary.main'
          : isPlatformPlane
          ? alpha(theme.palette.secondary.main, 0.35)
          : alpha(theme.palette.primary.main, 0.25),
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(12px)',
        boxShadow: selected
          ? `0 0 20px ${alpha(isPlatformPlane ? theme.palette.secondary.main : theme.palette.primary.main, 0.4)}`
          : `0 4px 12px ${alpha('#000', 0.1)}`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Plane Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Chip
          icon={isPlatformPlane ? <PublicIcon sx={{ fontSize: '12px !important' }} /> : <BusinessIcon sx={{ fontSize: '12px !important' }} />}
          label={isPlatformPlane ? 'Platform Plane' : 'Tenant Plane'}
          size='small'
          color={isPlatformPlane ? 'secondary' : 'default'}
          variant={isPlatformPlane ? 'filled' : 'outlined'}
          sx={{
            fontSize: 9,
            height: 18,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        />
        {data.requireMfa && (
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '10px !important' }} />}
            label='MFA Required'
            size='small'
            color='warning'
            sx={{ fontSize: 9, height: 18, fontWeight: 700 }}
          />
        )}
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 2,
            bgcolor: alpha(isPlatformPlane ? theme.palette.secondary.main : theme.palette.primary.main, 0.15),
            color: isPlatformPlane ? 'secondary.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PersonIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
            Subject / Principal
          </Typography>
          <Typography variant='subtitle2' sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
            {data.label || 'Principal Roles'}
          </Typography>
        </Box>
      </Box>

      {/* Role badges */}
      <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: 11 }}>
        Roles:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {roles.map((role) => {
          const isPlatform = isPlatformRole(role)
          return (
            <Chip
              key={role}
              label={role}
              size='small'
              color={isPlatform ? 'secondary' : 'primary'}
              variant='outlined'
              sx={{ fontSize: 11, height: 22, fontWeight: 700, borderRadius: 1.5 }}
            />
          )
        })}
      </Box>

      {/* Permissions / Badges */}
      {permissions.length > 0 && (
        <Stack direction='row' spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          {permissions.map((perm) => (
            <Chip
              key={perm}
              icon={<VpnKeyIcon sx={{ fontSize: '12px !important' }} />}
              label={perm}
              size='small'
              sx={{ fontSize: 10, height: 20, bgcolor: 'action.hover' }}
            />
          ))}
        </Stack>
      )}

      {/* React Flow Source Handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='subject-out'
        style={{
          width: 10,
          height: 10,
          backgroundColor: isPlatformPlane ? theme.palette.secondary.main : theme.palette.primary.main,
          border: `2px solid ${theme.palette.background.paper}`,
        }}
      />
    </Paper>
  )
})

SubjectNodeComponent.displayName = 'SubjectNode'
