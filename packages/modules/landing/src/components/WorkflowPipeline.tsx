/**
 * WorkflowPipeline - Visual Workflow Progress Component
 *
 * Displays the 7-step job seeker workflow with:
 * - Step indicators with completion status
 * - Current step highlighting
 * - Navigation between steps
 * - Progress percentage
 */

import React from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { stepConnectorClasses } from '@mui/material/StepConnector'
import { useNavigate } from 'react-router-dom'

// Icons for each step
import PersonIcon from '@mui/icons-material/Person'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import SearchIcon from '@mui/icons-material/Search'
import WorkIcon from '@mui/icons-material/Work'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AutoModeIcon from '@mui/icons-material/AutoMode'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'

import { useWorkflow, WORKFLOW_STEPS, type WorkflowStep } from '../context/WorkflowContext'

// ============================================================================
// Styled Components
// ============================================================================

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #4CAF50 0%, #2196F3 50%, #673AB7 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #4CAF50 0%, #2196F3 50%, #673AB7 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}))

interface ColorlibStepIconProps {
  active: boolean
  completed: boolean
  locked: boolean
  step: number
}

const ColorlibStepIconRoot = styled('div')<ColorlibStepIconProps>(
  ({ theme, active, completed, locked }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: locked ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    ...(active && {
      backgroundImage: 'linear-gradient(136deg, #2196F3 0%, #1976D2 50%, #0D47A1 100%)',
      boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
      transform: 'scale(1.1)',
    }),
    ...(completed && {
      backgroundImage: 'linear-gradient(136deg, #4CAF50 0%, #388E3C 50%, #1B5E20 100%)',
    }),
    ...(locked && {
      backgroundColor: theme.palette.grey[400],
      opacity: 0.6,
    }),
    '&:hover': {
      ...(!locked && {
        transform: 'scale(1.1)',
        boxShadow: '0 6px 12px 0 rgba(0,0,0,.3)',
      }),
    },
  }),
)

// ============================================================================
// Step Icon Component
// ============================================================================

const STEP_ICONS: Record<number, React.ReactElement> = {
  1: <PersonIcon />,
  2: <AnalyticsIcon />,
  3: <SearchIcon />,
  4: <WorkIcon />,
  5: <AssessmentIcon />,
  6: <AutoModeIcon />,
  7: <TrackChangesIcon />,
}

interface StepIconComponentProps {
  active?: boolean
  completed?: boolean
  icon: React.ReactNode
  step: number
  locked: boolean
  onClick: () => void
}

function StepIconComponent({
  active = false,
  completed = false,
  step,
  locked,
  onClick,
}: StepIconComponentProps) {
  const icon = completed ? <CheckCircleIcon /> : locked ? <LockIcon /> : STEP_ICONS[step]

  return (
    <Tooltip
      title={locked ? 'Complete previous steps first' : WORKFLOW_STEPS[step as WorkflowStep].name}
      arrow
    >
      <ColorlibStepIconRoot
        active={active}
        completed={completed}
        locked={locked}
        step={step}
        onClick={locked ? undefined : onClick}
      >
        {icon}
      </ColorlibStepIconRoot>
    </Tooltip>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface WorkflowPipelineProps {
  showProgress?: boolean
  compact?: boolean
  onStepClick?: (step: WorkflowStep) => void
}

export function WorkflowPipeline({
  showProgress = true,
  compact = false,
  onStepClick,
}: WorkflowPipelineProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const {
    currentStep,
    completedSteps,
    isStepCompleted,
    canAccessStep,
    getProgressPercentage,
    setStep,
  } = useWorkflow()

  const handleStepClick = (step: WorkflowStep) => {
    if (!canAccessStep(step)) return

    setStep(step)
    if (onStepClick) {
      onStepClick(step)
    } else {
      navigate(WORKFLOW_STEPS[step].path)
    }
  }

  const progress = getProgressPercentage()

  if (compact) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            Workflow Progress
          </Typography>
          <Chip
            label={`Step ${currentStep} of 7`}
            size='small'
            color='primary'
            variant='outlined'
          />
          <Chip
            label={`${progress}%`}
            size='small'
            color={progress === 100 ? 'success' : 'default'}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((step) => {
            const stepNum = step as WorkflowStep
            const isActive = step === currentStep
            const isCompleted = isStepCompleted(stepNum)
            const isLocked = !canAccessStep(stepNum)

            return (
              <Tooltip key={step} title={WORKFLOW_STEPS[stepNum].name} arrow>
                <IconButton
                  size='small'
                  onClick={() => handleStepClick(stepNum)}
                  disabled={isLocked}
                  sx={{
                    bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.300',
                    color: isCompleted || isActive ? 'white' : 'grey.600',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: isCompleted
                        ? 'success.dark'
                        : isActive
                          ? 'primary.dark'
                          : 'grey.400',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.200',
                      color: 'grey.400',
                    },
                  }}
                >
                  <Typography variant='caption' sx={{ fontWeight: 'bold' }}>
                    {step}
                  </Typography>
                </IconButton>
              </Tooltip>
            )
          })}
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Job Seeker Workflow
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {WORKFLOW_STEPS[currentStep].name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`Step ${currentStep} of 7`} color='primary' variant='outlined' />
          {completedSteps.length > 0 && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${completedSteps.length} completed`}
              color='success'
              variant='outlined'
            />
          )}
        </Box>
      </Box>

      {/* Progress Bar */}
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Overall Progress
            </Typography>
            <Typography variant='caption' color='primary' sx={{ fontWeight: 600 }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundImage: 'linear-gradient(90deg, #4CAF50, #2196F3, #673AB7)',
              },
            }}
          />
        </Box>
      )}

      {/* Stepper */}
      <Stepper alternativeLabel activeStep={currentStep - 1} connector={<ColorlibConnector />}>
        {[1, 2, 3, 4, 5, 6, 7].map((step) => {
          const stepNum = step as WorkflowStep
          const stepInfo = WORKFLOW_STEPS[stepNum]
          const isActive = step === currentStep
          const isCompleted = isStepCompleted(stepNum)
          const isLocked = !canAccessStep(stepNum)

          return (
            <Step key={step} completed={isCompleted}>
              <StepLabel
                StepIconComponent={(props) => (
                  <StepIconComponent
                    {...props}
                    step={step}
                    active={isActive}
                    completed={isCompleted}
                    locked={isLocked}
                    onClick={() => handleStepClick(stepNum)}
                  />
                )}
              >
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? 'primary.main'
                      : isCompleted
                        ? 'success.main'
                        : 'text.secondary',
                  }}
                >
                  {stepInfo.name}
                </Typography>
              </StepLabel>
            </Step>
          )
        })}
      </Stepper>
    </Paper>
  )
}

export default WorkflowPipeline
