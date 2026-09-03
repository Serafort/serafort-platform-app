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
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import { modulesRouterService } from '@cap/platform-core'
import type { ModulePipelineJob, PipelineStage } from '@cap/shared-types'

interface ModuleUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const PIPELINE_STEPS: { stage: PipelineStage; label: string; desc: string }[] = [
  { stage: 'UPLOADING', label: 'Upload Archive', desc: 'Receiving zip payload' },
  { stage: 'EXTRACTING', label: 'Unpack & Inspect', desc: 'Sanitizing archive & Zip Slip checks' },
  { stage: 'VALIDATING_CONTRACT', label: 'Validate Contract', desc: 'Verifying CAPModule exports' },
  { stage: 'RUNNING_TESTS', label: 'Run Test Suite', desc: 'Running unit tests & TypeScript checks' },
  { stage: 'PROMOTING', label: 'Auto-Register', desc: 'Deploying into repository workspace' },
]

export const ModuleUploadModal: React.FC<ModuleUploadModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeJob, setActiveJob] = useState<ModulePipelineJob | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState(true)
  const [_logCopied, setLogCopied] = useState(false)

  const activeStepIndex = React.useMemo(() => {
    if (!activeJob) return 0
    if (activeJob.currentStage === 'COMPLETE') return PIPELINE_STEPS.length
    if (activeJob.currentStage === 'FAILED') {
      const failedIdx = PIPELINE_STEPS.findIndex(
        (s) => s.stage === activeJob.stages.find((st) => st.status === 'error')?.stage,
      )
      return failedIdx !== -1 ? failedIdx : 0
    }
    const currentIdx = PIPELINE_STEPS.findIndex((s) => s.stage === activeJob.currentStage)
    return currentIdx !== -1 ? currentIdx : 0
  }, [activeJob])

  // Polling loop for active job status
  useEffect(() => {
    if (!activeJob || activeJob.currentStage === 'COMPLETE' || activeJob.currentStage === 'FAILED') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const updated = await modulesRouterService.getJobStatus(activeJob.jobId)
        setActiveJob(updated)

        if (updated.currentStage === 'COMPLETE') {
          setIsUploading(false)
          if (onSuccess) onSuccess()
        } else if (updated.currentStage === 'FAILED') {
          setIsUploading(false)
          setErrorMessage(updated.error || 'Pipeline execution failed')
        }
      } catch (err: any) {
        console.error('Polling job status error:', err)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [activeJob, onSuccess])

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setIsUploading(false)
    setActiveJob(null)
    setErrorMessage(null)
  }, [])

  const handleClose = () => {
    if (isUploading) return
    handleReset()
    onClose()
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setErrorMessage('Invalid file format. Please upload a valid .zip module archive.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds 50MB limit.')
      return
    }
    setErrorMessage(null)
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUploadStart = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMessage(null)

    try {
      const response = await modulesRouterService.uploadModuleZip(selectedFile)
      const initialJob = await modulesRouterService.getJobStatus(response.jobId)
      setActiveJob(initialJob)
    } catch (err: any) {
      setIsUploading(false)
      setErrorMessage(err.message || 'Failed to launch upload pipeline')
    }
  }

  const handleCopyLogs = () => {
    if (!activeJob) return
    navigator.clipboard.writeText(activeJob.logs.join('\n'))
    setLogCopied(true)
    setTimeout(() => setLogCopied(false), 2000)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: 'divider',
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
              borderRadius: 2,
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
              Module Package Uploader
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Upload zip archive to validate, test, and auto-register new features
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={isUploading} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Dropzone area when no upload in progress */}
        {!activeJob && (
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
              borderRadius: 3,
              border: '2px dashed',
              borderColor: isDragOver
                ? 'primary.main'
                : selectedFile
                ? 'success.main'
                : 'divider',
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
              accept='.zip'
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0])
                }
              }}
            />

            {selectedFile ? (
              <Stack spacing={1.5} alignItems='center'>
                <InsertDriveFileIcon sx={{ fontSize: 48, color: 'success.main' }} />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {selectedFile.name}
                </Typography>
                <Chip
                  label={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                  color='success'
                  size='small'
                  variant='outlined'
                />
                <Typography variant='caption' color='text.secondary'>
                  Click or drag another file to replace
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1.5} alignItems='center'>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.8 }} />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  Drag & Drop Module Zip Package Here
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  or click to browse your file system (.zip files up to 50MB)
                </Typography>
              </Stack>
            )}
          </Paper>
        )}

        {/* Live Stepper & Log Terminal during pipeline execution */}
        {activeJob && (
          <Stack spacing={3}>
            <Stepper activeStep={activeStepIndex} alternativeLabel>
              {PIPELINE_STEPS.map((step, idx) => {
                const isFailedStep =
                  activeJob.currentStage === 'FAILED' && idx === activeStepIndex
                return (
                  <Step key={step.stage}>
                    <StepLabel
                      error={isFailedStep}
                      StepIconComponent={() => (
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
                              : idx < activeStepIndex || activeJob.currentStage === 'COMPLETE'
                              ? 'success.main'
                              : idx === activeStepIndex
                              ? 'primary.main'
                              : 'action.disabledBackground',
                            color: 'white',
                          }}
                        >
                          {isFailedStep ? (
                            <ErrorIcon fontSize='small' />
                          ) : idx < activeStepIndex || activeJob.currentStage === 'COMPLETE' ? (
                            <CheckCircleIcon fontSize='small' />
                          ) : idx === activeStepIndex ? (
                            <CircularProgress size={16} color='inherit' />
                          ) : (
                            <Typography variant='caption' sx={{ fontWeight: 800 }}>
                              {idx + 1}
                            </Typography>
                          )}
                        </Box>
                      )}
                    >
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        {step.label}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {step.desc}
                      </Typography>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>

            {/* Status Alert */}
            {activeJob.currentStage === 'COMPLETE' && (
              <Alert severity='success' icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
                Module <strong>"{activeJob.moduleId}"</strong> has been successfully validated,
                tested, and auto-registered!
              </Alert>
            )}

            {/* Logs Terminal Window */}
            <Paper
              sx={{
                bgcolor: '#0d1117',
                color: '#c9d1d9',
                borderRadius: 3,
                border: '1px solid',
                borderColor: '#30363d',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: '#161b22',
                  borderBottom: '1px solid #30363d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 18, color: '#58a6ff' }} />
                  <Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    Pipeline Diagnostic Logs
                  </Typography>
                </Box>
                <Stack direction='row' spacing={0.5}>
                  <IconButton size='small' onClick={handleCopyLogs} sx={{ color: '#8b949e' }}>
                    <ContentCopyIcon fontSize='inherit' />
                  </IconButton>
                  <IconButton
                    size='small'
                    onClick={() => setShowLogs(!showLogs)}
                    sx={{ color: '#8b949e' }}
                  >
                    {showLogs ? <ExpandLessIcon fontSize='inherit' /> : <ExpandMoreIcon fontSize='inherit' />}
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
                  }}
                >
                  {activeJob.logs.map((logLine, index) => {
                    const isError = logLine.includes('[ERROR]') || logLine.includes('Failed')
                    const isSuccess = logLine.includes('COMPLETE') || logLine.includes('success')
                    return (
                      <Box
                        key={index}
                        sx={{
                          color: isError ? '#ff7b72' : isSuccess ? '#7ee787' : '#c9d1d9',
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
            <Button onClick={handleClose} variant='outlined' color='inherit' sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadStart}
              variant='contained'
              disabled={!selectedFile || isUploading}
              startIcon={isUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            >
              Start Pipeline & Register
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleReset}
              variant='outlined'
              disabled={isUploading}
              sx={{ borderRadius: 2 }}
            >
              Upload Another Package
            </Button>
            <Button
              onClick={handleClose}
              variant='contained'
              disabled={isUploading}
              sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            >
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ModuleUploadModal
