import React, { useState, useEffect } from 'react'
import { Box, Typography, Button, Stack, Chip, alpha, useTheme } from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import TimerIcon from '@mui/icons-material/Timer'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useAppStore, type AppStore } from '@cap/platform-store'

export interface ImpersonationBannerProps {
  onExit?: () => void
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ onExit }) => {
  const theme = useTheme()
  const impersonationSession = useAppStore((state: AppStore) => state.impersonationSession)
  const stopImpersonation = useAppStore((state: AppStore) => state.stopImpersonation)

  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!impersonationSession?.expiresAt) {
      setTimeLeft('')
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = impersonationSession.expiresAt - now
      if (diff <= 0) {
        setTimeLeft('Expired')
        stopImpersonation()
        return
      }
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [impersonationSession, stopImpersonation])

  if (!impersonationSession) return null

  const handleExit = () => {
    stopImpersonation()
    if (onExit) onExit()
  }

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: theme.palette.warning.dark || '#ed6c02',
        color: '#ffffff',
        px: { xs: 2, md: 3 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        borderBottom: `2px solid ${alpha('#ffffff', 0.35)}`,
        boxShadow: `0 4px 16px ${alpha('#000000', 0.25)}`,
        zIndex: 1400,
        position: 'relative',
      }}
    >
      <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: alpha('#000000', 0.25),
            px: 1.25,
            py: 0.35,
            borderRadius: 1.5,
            border: `1px solid ${alpha('#ffffff', 0.25)}`,
          }}
        >
          <VisibilityIcon sx={{ fontSize: 16 }} />
          <Typography variant='caption' sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.75 }}>
            Active Impersonation
          </Typography>
        </Box>

        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          Viewing workspace as: <strong>{impersonationSession.targetOrgName || `Org #${impersonationSession.targetOrgId}`}</strong>
        </Typography>

        {impersonationSession.reason && (
          <Typography variant='caption' sx={{ opacity: 0.9, display: { xs: 'none', sm: 'inline' } }}>
            (Reason: {impersonationSession.reason})
          </Typography>
        )}

        <Chip
          icon={<SecurityIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />}
          label='Audit Logged'
          size='small'
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: alpha('#ffffff', 0.2),
            color: '#ffffff',
          }}
        />

        {timeLeft && (
          <Chip
            icon={<TimerIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />}
            label={`Session expires in: ${timeLeft}`}
            size='small'
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: alpha('#000000', 0.35),
              color: '#ffffff',
            }}
          />
        )}
      </Stack>

      <Button
        variant='contained'
        size='small'
        onClick={handleExit}
        startIcon={<ExitToAppIcon sx={{ fontSize: 16 }} />}
        sx={{
          bgcolor: '#ffffff',
          color: theme.palette.warning.dark || '#ed6c02',
          fontWeight: 900,
          textTransform: 'none',
          px: 2,
          py: 0.5,
          fontSize: 13,
          borderRadius: 2,
          boxShadow: `0 4px 12px ${alpha('#000000', 0.3)}`,
          '&:hover': {
            bgcolor: alpha('#ffffff', 0.92),
            boxShadow: `0 6px 16px ${alpha('#000000', 0.4)}`,
          },
        }}
      >
        Exit Impersonation
      </Button>
    </Box>
  )
}

export default ImpersonationBanner
