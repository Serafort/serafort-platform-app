import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Paper,
  Stack,
  Chip,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import TerminalIcon from '@mui/icons-material/Terminal'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getErrorMessage } from '../../../utils/errors'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useTranslation } from 'react-i18next'

import { modulesRouterService } from '@cap/platform-core'
import type { ModulePipelineJob, PipelineStage } from '@cap/shared-types'

interface ModuleUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024

const PIPELINE_STEPS: { stage: PipelineStage; labelKey: string; label: string; descKey: string; desc: string }[] =
  [
    {
      stage: 'READING',
      labelKey: 'monitoring.modules.step_read',
      label: 'Read Archive',
      descKey: 'monitoring.modules.step_read_desc',
      desc: 'Parsing the ZIP directory',
    },
    {
      stage: 'INSPECTING',
      labelKey: 'monitoring.modules.step_inspect',
      label: 'Inspect Entries',
      descKey: 'monitoring.modules.step_inspect_desc',
      desc: 'Path-traversal and expansion checks',
    },
    {
      stage: 'VALIDATING',
      labelKey: 'monitoring.modules.step_validate',
      label: 'Validate Contract',
      descKey: 'monitoring.modules.step_validate_desc',
      desc: 'Checking the CAPModule manifest',
    },
  ]

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export const ModuleUploadModal: React.FC<ModuleUploadModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isInspecting, setIsInspecting] = useState(false)
  const [activeJob, setActiveJob] = useState<ModulePipelineJob | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState(true)
  const [logsCopied, setLogsCopied] = useState(false)

  const isFinished = activeJob?.currentStage === 'COMPLETE' || activeJob?.currentStage === 'FAILED'

  const activeStepIndex = React.useMemo(() => {
    if (!activeJob) return 0
    if (activeJob.currentStage === 'COMPLETE') return PIPELINE_STEPS.length
    if (activeJob.currentStage === 'FAILED') {
      const failedStage = activeJob.stages.find((st) => st.status === 'error')?.stage
      const failedIdx = PIPELINE_STEPS.findIndex((s) => s.stage === failedStage)
      return failedIdx !== -1 ? failedIdx : 0
    }
    const currentIdx = PIPELINE_STEPS.findIndex((s) => s.stage === activeJob.currentStage)
    return currentIdx !== -1 ? currentIdx : 0
  }, [activeJob])

  // Keyed on the job id, not the job object: every poll tick produces a new
  // object, and depending on it would tear down and rebuild the interval.
  const jobId = activeJob?.jobId

  useEffect(() => {
    if (!jobId || isFinished) return

    const interval = setInterval(async () => {
      try {
        setActiveJob({ ...(await modulesRouterService.getJobStatus(jobId)) })
      } catch (err) {
        console.error('Polling job status error:', err)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [jobId, isFinished])

  // Settle separately from the poll: a small archive can finish before the
  // first tick, and the poll would then never observe the transition. Guarded
  // by job id and held behind a ref so a parent re-render (which `onSuccess`
  // triggers) cannot run the completion handler a second time.
  const settledJobIdRef = useRef<string | null>(null)
  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  useEffect(() => {
    if (!activeJob || !isFinished || settledJobIdRef.current === activeJob.jobId) return
    settledJobIdRef.current = activeJob.jobId
    setIsInspecting(false)

    if (activeJob.currentStage === 'COMPLETE') {
      onSuccessRef.current?.()
    } else if (!activeJob.validation) {
      // Contract failures are already listed item by item below; only surface
      // failures that never reached validation (unreadable or unsafe archive).
      setErrorMessage(
        activeJob.error || t('monitoring.modules.inspect_failed', 'Inspection failed.'),
      )
    }
  }, [activeJob, isFinished, t])

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setIsInspecting(false)
    setActiveJob(null)
    setErrorMessage(null)
    settledJobIdRef.current = null
  }, [])

  const handleClose = () => {
    if (isInspecting) return
    handleReset()
    onClose()
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage(
        t('monitoring.modules.err_format', 'Invalid file format. Please select a .zip archive.'),
      )
      return
    }
    if (file.size > MAX_ARCHIVE_BYTES) {
      setErrorMessage(t('monitoring.modules.err_size', 'File size exceeds the 50 MB limit.'))
      return
    }
    setErrorMessage(null)
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.length) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInspectStart = async () => {
    if (!selectedFile) return
    setIsInspecting(true)
    setErrorMessage(null)

    try {
      const response = await modulesRouterService.uploadModuleZip(selectedFile)
      // Copy: the service mutates its own job object, and React needs a new
      // reference on every observed change.
      setActiveJob({ ...(await modulesRouterService.getJobStatus(response.jobId)) })
    } catch (err: unknown) {
      setIsInspecting(false)
      setErrorMessage(
        getErrorMessage(err) || t('monitoring.modules.inspect_start_failed', 'Could not read that archive.'),
      )
    }
  }

  const handleCopyLogs = async () => {
    if (!activeJob) return
    try {
      await navigator.clipboard.writeText(activeJob.logs.join('\n'))
      setLogsCopied(true)
      setTimeout(() => setLogsCopied(false), 2000)
    } catch {
      setErrorMessage(t('monitoring.modules.copy_failed', 'Could not copy the logs.'))
    }
  }

  const validation = activeJob?.validation

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--sf-radius-lg, 12px)',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 'var(--sf-radius-md, 8px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadIcon />
          </Box>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800 }}>
              {t('monitoring.modules.modal_title', 'Module Package Inspector')}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {t(
                'monitoring.modules.modal_subtitle',
                'Check a .zip against the CAPModule contract before it goes into the workspace.',
              )}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isInspecting}
          size='small'
          aria-label={t('monitoring.modules.close', 'Close')}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}>
            {errorMessage}
          </Alert>
        )}

        {!activeJob && (
          <Stack spacing={2}>
            <Paper
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 'var(--sf-radius-lg, 12px)',
                border: '2px dashed',
                borderColor: isDragOver ? 'primary.main' : selectedFile ? 'success.main' : 'divider',
                bgcolor: isDragOver
                  ? alpha(theme.palette.primary.main, 0.05)
                  : selectedFile
                    ? alpha(theme.palette.success.main, 0.03)
                    : alpha(theme.palette.text.primary, 0.02),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <input
                type='file'
                ref={fileInputRef}
                accept='.zip,application/zip'
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.length) handleFileSelect(e.target.files[0])
                }}
              />

              {selectedFile ? (
                <Stack spacing={1.5} alignItems='center'>
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>
                    {selectedFile.name}
                  </Typography>
                  <Chip
                    label={formatBytes(selectedFile.size)}
                    color='success'
                    size='small'
                    variant='outlined'
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {t('monitoring.modules.drop_replace', 'Click or drag another file to replace')}
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={1.5} alignItems='center'>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.8 }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    {t('monitoring.modules.drop_title', 'Drag & drop a module .zip here')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t(
                      'monitoring.modules.drop_hint',
                      'or click to browse your file system (.zip up to 50 MB)',
                    )}
                  </Typography>
                </Stack>
              )}
            </Paper>

            <Alert severity='info' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
              {t(
                'monitoring.modules.inspect_only_notice',
                'This inspector validates a package; it does not install one. Installing a module means adding it under packages/modules/ and rebuilding the workspace.',
              )}
            </Alert>
          </Stack>
        )}

        {activeJob && (
          <Stack spacing={3}>
            <Stepper activeStep={activeStepIndex} alternativeLabel>
              {PIPELINE_STEPS.map((step, idx) => {
                const isFailedStep = activeJob.currentStage === 'FAILED' && idx === activeStepIndex
                const isDone = idx < activeStepIndex || activeJob.currentStage === 'COMPLETE'
                return (
                  <Step key={step.stage}>
                    <StepLabel
                      error={isFailedStep}
                      slots={{
                        stepIcon: () => (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: isFailedStep
                                ? 'error.main'
                                : isDone
                                  ? 'success.main'
                                  : idx === activeStepIndex
                                    ? 'primary.main'
                                    : 'action.disabledBackground',
                              color: 'common.white',
                            }}
                          >
                            {isFailedStep ? (
                              <ErrorIcon fontSize='small' />
                            ) : isDone ? (
                              <CheckCircleIcon fontSize='small' />
                            ) : idx === activeStepIndex ? (
                              <CircularProgress size={16} color='inherit' />
                            ) : (
                              <Typography variant='caption' sx={{ fontWeight: 800 }}>
                                {idx + 1}
                              </Typography>
                            )}
                          </Box>
                        ),
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        {t(step.labelKey, step.label)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {t(step.descKey, step.desc)}
                      </Typography>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>

            {/* Real archive facts */}
            {activeJob.entryCount != null && (
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                <Chip
                  size='small'
                  variant='outlined'
                  label={t('monitoring.modules.archive_files', {
                    count: activeJob.entryCount,
                    defaultValue_one: '{{count}} file',
                    defaultValue: '{{count}} files',
                  })}
                />
                <Chip
                  size='small'
                  variant='outlined'
                  label={t('monitoring.modules.archive_expands', {
                    size: formatBytes(activeJob.uncompressedBytes ?? 0),
                    defaultValue: 'expands to {{size}}',
                  })}
                />
                {activeJob.moduleId && (
                  <Chip
                    size='small'
                    variant='outlined'
                    color='primary'
                    sx={{ fontFamily: 'monospace' }}
                    label={`${activeJob.moduleId}${activeJob.version ? ` · v${activeJob.version}` : ''}`}
                  />
                )}
              </Stack>
            )}

            {activeJob.currentStage === 'COMPLETE' && (
              <Alert severity='success' icon={<CheckCircleIcon />} sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>
                  {t('monitoring.modules.result_valid_title', 'Package is a valid CAPModule')}
                </AlertTitle>
                {t('monitoring.modules.result_valid_body', {
                  id: activeJob.moduleId,
                  defaultValue:
                    '"{{id}}" passed contract validation. It has not been installed: add the package under packages/modules/ and restart the dev server to register it.',
                })}
              </Alert>
            )}

            {validation && validation.errors.length > 0 && (
              <Alert severity='error' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>
                  {t('monitoring.modules.result_errors_title', 'Contract validation failed')}
                </AlertTitle>
                <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
                  {validation.errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {validation && validation.warnings.length > 0 && (
              <Alert severity='warning' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>
                  {t('monitoring.modules.result_warnings_title', 'Warnings')}
                </AlertTitle>
                <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
                  {validation.warnings.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Diagnostic log */}
            <Paper
              sx={(theme) => ({
                // A log console is a dark surface in both colour modes.
                bgcolor: theme.palette.grey[900],
                color: theme.palette.grey[300],
                borderRadius: 'var(--sf-radius-lg, 12px)',
                border: '1px solid',
                borderColor: theme.palette.grey[800],
                overflow: 'hidden',
              })}
            >
              <Box
                sx={(theme) => ({
                  px: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.common.white, 0.04),
                  borderBottom: '1px solid',
                  borderColor: theme.palette.grey[800],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 18, color: 'info.light' }} />
                  <Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {t('monitoring.modules.logs_title', 'Inspection log')}
                  </Typography>
                </Box>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  {logsCopied && (
                    <Typography variant='caption' sx={{ color: 'success.light' }}>
                      {t('monitoring.modules.logs_copied', 'Copied')}
                    </Typography>
                  )}
                  <IconButton
                    size='small'
                    onClick={handleCopyLogs}
                    sx={{ color: 'grey.400', minWidth: 44, minHeight: 44 }}
                    aria-label={t('monitoring.modules.logs_copy', 'Copy log')}
                  >
                    <ContentCopyIcon fontSize='inherit' />
                  </IconButton>
                  <IconButton
                    size='small'
                    onClick={() => setShowLogs(!showLogs)}
                    sx={{ color: 'grey.400', minWidth: 44, minHeight: 44 }}
                    aria-expanded={showLogs}
                    aria-label={t('monitoring.modules.logs_toggle', 'Toggle log')}
                  >
                    {showLogs ? (
                      <ExpandLessIcon fontSize='inherit' />
                    ) : (
                      <ExpandMoreIcon fontSize='inherit' />
                    )}
                  </IconButton>
                </Stack>
              </Box>

              <Collapse in={showLogs}>
                <Box
                  sx={{
                    p: 2,
                    maxHeight: 220,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                >
                  {activeJob.logs.map((logLine, index) => {
                    const isError = logLine.startsWith('[ERROR]') || logLine.includes('[ERROR]')
                    const isWarning = logLine.includes('[WARN]')
                    return (
                      <Box
                        key={`${index}-${logLine}`}
                        sx={{
                          color: isError ? 'error.light' : isWarning ? 'warning.light' : 'grey.300',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {logLine}
                      </Box>
                    )
                  })}
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        {!activeJob ? (
          <>
            <Button
              onClick={handleClose}
              variant='outlined'
              color='inherit'
              sx={{ borderRadius: 'var(--sf-radius-md, 8px)', minHeight: 44 }}
            >
              {t('monitoring.modules.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleInspectStart}
              variant='contained'
              disabled={!selectedFile || isInspecting}
              startIcon={isInspecting ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              sx={{ borderRadius: 'var(--sf-radius-md, 8px)', px: 3, fontWeight: 700, minHeight: 44 }}
            >
              {t('monitoring.modules.inspect_start', 'Inspect package')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleReset}
              variant='outlined'
              disabled={isInspecting}
              sx={{ borderRadius: 'var(--sf-radius-md, 8px)', minHeight: 44 }}
            >
              {t('monitoring.modules.inspect_another', 'Inspect another package')}
            </Button>
            <Button
              onClick={handleClose}
              variant='contained'
              disabled={isInspecting}
              sx={{ borderRadius: 'var(--sf-radius-md, 8px)', px: 3, fontWeight: 700, minHeight: 44 }}
            >
              {t('monitoring.modules.done', 'Done')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ModuleUploadModal
