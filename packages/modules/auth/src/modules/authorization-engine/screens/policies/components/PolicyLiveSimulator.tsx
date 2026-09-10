import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SpeedIcon from '@mui/icons-material/Speed'
import CloseIcon from '@mui/icons-material/Close'
import ScienceIcon from '@mui/icons-material/Science'
import type {
  VisualPolicyGraph,
  PolicySimulationInput,
  PolicySimulationResult,
} from '@cap/authorization'
import { useTranslation } from 'react-i18next'
import { PolicyGraphCompiler } from '@cap/authorization'

interface PolicyLiveSimulatorProps {
  graph: VisualPolicyGraph
  onSimulationRun: (result: PolicySimulationResult) => void
  onClose: () => void
}

export const PolicyLiveSimulator: React.FC<PolicyLiveSimulatorProps> = ({
  graph,
  onSimulationRun,
  onClose,
}) => {
  const theme = useTheme()
  const { t } = useTranslation()

  // Scenario inputs
  const [subjectRoles, setSubjectRoles] = useState<string>('member')
  const [subjectOrgId, setSubjectOrgId] = useState<string>('org-acme')
  const [subjectMfa, setSubjectMfa] = useState<boolean>(true)
  const [action, setAction] = useState<string>('read')
  const [resourceType, setResourceType] = useState<string>('document')
  const [resourceOrgId, setResourceOrgId] = useState<string>('org-acme')

  const [simulationResult, setSimulationResult] = useState<PolicySimulationResult | null>(null)

  const handleRunSimulation = () => {
    const roles = subjectRoles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)

    const input: PolicySimulationInput = {
      subject: {
        id: 'user-sim-1',
        roles: roles.length > 0 ? roles : ['member'],
        permissions: [],
        attributes: {
          orgId: subjectOrgId,
          mfaVerified: subjectMfa,
        },
      },
      action: action.trim() || 'read',
      resource: {
        type: resourceType.trim() || 'document',
        id: 'res-sim-101',
        attributes: {
          orgId: resourceOrgId,
        },
      },
    }

    const result = PolicyGraphCompiler.simulateGraph(graph, input)
    setSimulationResult(result)
    onSimulationRun(result)
  }

  return (
    <Paper
      elevation={8}
      sx={{
        width: 380,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderInlineStart: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(16px)',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color='primary' />
          <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
            {t('auth.admin.policy.simulator_title', 'Policy simulator')}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={t('auth.common.close', 'Close')}
          sx={{ width: 44, height: 44 }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      {/* Input controls */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        <Typography
          variant='caption'
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {t('auth.admin.policy.step_context', '1. Test scenario')}
        </Typography>

        <Stack spacing={2} sx={{ mt: 1.5 }}>
          {/* Subject info */}
          <TextField
            label={t('auth.admin.policy.subject_roles', 'Subject roles (comma separated)')}
            size='small'
            fullWidth
            value={subjectRoles}
            onChange={(e) => setSubjectRoles(e.target.value)}
            placeholder={t('auth.admin.policy.subject_roles_placeholder', 'member, admin, finance')}
          />

          <TextField
            label={t('auth.admin.policy.subject_org', 'Subject organization ID')}
            size='small'
            fullWidth
            value={subjectOrgId}
            onChange={(e) => setSubjectOrgId(e.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={subjectMfa}
                onChange={(e) => setSubjectMfa(e.target.checked)}
                color='primary'
              />
            }
            label={
              <Typography variant='body2'>
                {t('auth.admin.policy.mfa_verified', 'MFA verified')}
              </Typography>
            }
          />

          <Divider sx={{ my: 0.5 }} />

          {/* Action selection */}
          <FormControl size='small' fullWidth>
            <InputLabel>{t('auth.admin.policy.action', 'Attempted action')}</InputLabel>
            <Select
              value={action}
              label={t('auth.admin.policy.action', 'Attempted action')}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value='read'>read</MenuItem>
              <MenuItem value='write'>write</MenuItem>
              <MenuItem value='delete'>delete</MenuItem>
              <MenuItem value='export'>export</MenuItem>
              <MenuItem value='execute'>execute</MenuItem>
              <MenuItem value='access'>access</MenuItem>
            </Select>
          </FormControl>

          {/* Resource info */}
          <FormControl size='small' fullWidth>
            <InputLabel>{t('auth.admin.policy.resource_type', 'Resource type')}</InputLabel>
            <Select
              value={resourceType}
              label={t('auth.admin.policy.resource_type', 'Resource type')}
              onChange={(e) => setResourceType(e.target.value)}
            >
              <MenuItem value='document'>document</MenuItem>
              <MenuItem value='invoice'>invoice</MenuItem>
              <MenuItem value='user'>user</MenuItem>
              <MenuItem value='settings'>settings</MenuItem>
              <MenuItem value='api_key'>api_key</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={t('auth.admin.policy.resource_org', 'Resource organization ID')}
            size='small'
            fullWidth
            value={resourceOrgId}
            onChange={(e) => setResourceOrgId(e.target.value)}
          />

          <Button
            variant='contained'
            color='primary'
            size='medium'
            startIcon={<PlayArrowIcon />}
            onClick={handleRunSimulation}
            sx={{ minHeight: 44, fontWeight: 800, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {t('auth.admin.policy.run', 'Run evaluation')}
          </Button>
        </Stack>

        {/* Results display */}
        {simulationResult && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {t('auth.admin.policy.step_outcome', '2. Outcome')}
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                borderRadius: 'var(--sf-radius-md, 10px)',
                border: '1.5px solid',
                borderColor:
                  simulationResult.effect === 'allow'
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                bgcolor: alpha(
                  simulationResult.effect === 'allow'
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  0.08,
                ),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Chip
                  icon={simulationResult.effect === 'allow' ? <CheckCircleIcon /> : <CancelIcon />}
                  label={
                    simulationResult.effect === 'allow'
                      ? t('auth.admin.policy.effect_allow', 'Allow')
                      : t('auth.admin.policy.effect_deny', 'Deny')
                  }
                  color={simulationResult.effect === 'allow' ? 'success' : 'error'}
                  sx={{ fontWeight: 900, px: 1, borderRadius: 'var(--sf-radius-sm, 6px)' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {simulationResult.durationMs}ms
                  </Typography>
                </Box>
              </Box>

              <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {simulationResult.reason}
              </Typography>
            </Paper>

            {/* Trace log */}
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mt: 2,
                display: 'block',
              }}
            >
              {t('auth.admin.policy.step_traces', {
                count: simulationResult.stepTraces.length,
                defaultValue: '3. Evaluation trace ({{count}} steps)',
              })}
            </Typography>

            <Stack spacing={1} sx={{ mt: 1 }}>
              {simulationResult.stepTraces.map((trace) => (
                <Box
                  key={trace.stepNumber}
                  sx={{
                    p: 1,
                    borderRadius: 'var(--sf-radius-sm, 6px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      trace.status === 'pass'
                        ? alpha(theme.palette.success.main, 0.05)
                        : alpha(theme.palette.error.main, 0.05),
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`#${trace.stepNumber}`}
                    size='small'
                    color={trace.status === 'pass' ? 'success' : 'error'}
                    sx={{ height: 20, fontSize: 10, fontWeight: 800, borderRadius: 'var(--sf-radius-sm, 6px)' }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='caption'
                      sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}
                    >
                      {trace.nodeType.toUpperCase()} ({trace.nodeId})
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-word' }}
                    >
                      {trace.message}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
