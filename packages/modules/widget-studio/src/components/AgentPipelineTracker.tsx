import React from 'react'
import {
  Box,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Collapse,
} from '@mui/material'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ErrorRounded from '@mui/icons-material/ErrorRounded'
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import type { AgentState, AgentId } from '@cap/shared-types'

interface AgentPipelineTrackerProps {
  agents: AgentState[]
}

const AGENT_LABELS: Record<AgentId, { label: string; description: string }> = {
  requirement: {
    label: 'Requirement Agent',
    description: 'Extracting features from your prompt',
  },
  design: {
    label: 'Design Agent',
    description: 'Planning layout and UX specification',
  },
  component: {
    label: 'Component Agent',
    description: 'Selecting registered widget components',
  },
  validation: {
    label: 'Validation Agent',
    description: 'Running security & schema checks',
  },
  preview: {
    label: 'Preview Agent',
    description: 'Generating component preview',
  },
  publish: {
    label: 'Publish Agent',
    description: 'Publishing widget to dashboard',
  },
}

const StatusIcon: React.FC<{ status: AgentState['status'] }> = ({ status }) => {
  switch (status) {
    case 'done':
      return <CheckCircleRounded sx={{ fontSize: 18, color: 'success.main' }} />
    case 'error':
      return <ErrorRounded sx={{ fontSize: 18, color: 'error.main' }} />
    case 'running':
      return (
        <HourglassEmptyRounded
          sx={{
            fontSize: 18,
            color: 'primary.main',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
          }}
        />
      )
    default:
      return <RadioButtonUncheckedRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
  }
}

const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({ agents }) => {
  const totalDone = agents.filter((a) => a.status === 'done').length
  const progress = (totalDone / agents.length) * 100

  return (
    <Box>
      {/* Overall progress bar */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Pipeline Progress
          </Typography>
          <Typography variant="caption" color="primary.main" fontWeight={700}>
            {totalDone}/{agents.length}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ borderRadius: 4, height: 6 }}
        />
      </Box>

      {/* Agent step cards */}
      <Stack spacing={0.5}>
        {agents.map((agent, idx) => {
          const meta = AGENT_LABELS[agent.id]
          const isActive = agent.status === 'running'

          return (
            <Box
              key={agent.id}
              id={`widget-studio-agent-${agent.id}`}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: isActive
                  ? 'primary.main'
                  : agent.status === 'done'
                  ? 'success.main'
                  : agent.status === 'error'
                  ? 'error.main'
                  : 'divider',
                bgcolor: isActive
                  ? 'primary.main'
                  : agent.status === 'done'
                  ? 'success.main'
                  : 'transparent',
                opacity: isActive ? 1 : agent.status === 'idle' && idx !== 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
                ...(isActive && { bgcolor: (theme) => `${theme.palette.primary.main}12` }),
                ...(agent.status === 'done' && { bgcolor: (theme) => `${theme.palette.success.main}10` }),
                ...(agent.status === 'error' && { bgcolor: (theme) => `${theme.palette.error.main}10` }),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ pt: 0.25 }}>
                  <StatusIcon status={agent.status} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {meta.label}
                    </Typography>
                    {agent.status !== 'idle' && (
                      <Chip
                        label={agent.status}
                        size="small"
                        color={
                          agent.status === 'done'
                            ? 'success'
                            : agent.status === 'error'
                            ? 'error'
                            : agent.status === 'running'
                            ? 'primary'
                            : 'default'
                        }
                        sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {agent.status === 'error' ? agent.error : meta.description}
                  </Typography>

                  {/* Streaming text — typewriter effect */}
                  <Collapse in={Boolean(agent.streamedText && agent.status !== 'idle')}>
                    <Box
                      sx={{
                        mt: 0.75,
                        p: 0.75,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        color: 'text.secondary',
                        maxHeight: 80,
                        overflow: 'hidden auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {agent.streamedText}
                      {agent.status === 'running' && (
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: 6,
                            height: 12,
                            bgcolor: 'primary.main',
                            ml: 0.25,
                            animation: 'blink 0.8s ease infinite',
                            '@keyframes blink': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0 },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Collapse>
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default AgentPipelineTracker
