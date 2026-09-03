import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
  Chip,
  alpha,
  useTheme,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { stepperTokens } from '@cap/theme'
import { useCreateToken } from '@auth/user-directory/hooks/useUserQuery'
import { Path } from '@auth/routes/path'
import { usePersistentForm } from '@cap/platform-core'
import CreateAPITokenBasicInfo from './CreateAPITokenBasicInfo'
import CreateAPITokenIPRestrictions from './CreateAPITokenIPRestrictions'

export interface APITokenDraftForm {
  name: string
  expiresIn: string
  abilities: string[]
  ipRestrictions: string[]
}

const INITIAL_TOKEN_DRAFT: APITokenDraftForm = {
  name: '',
  expiresIn: '30 days',
  abilities: [],
  ipRestrictions: [],
}

export const CreateAPITokenWizard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const locationState = location.state as Partial<APITokenDraftForm> | null
  const [activeStep, setActiveStep] = useState<number>(0)

  // Use persistent form for draft resilience (Zeigarnik Effect / Postel's Law)
  const { formData, handleChange, setFormData, clearForm } = usePersistentForm<APITokenDraftForm>(
    'create_api_token_wizard',
    {
      ...INITIAL_TOKEN_DRAFT,
      ...(locationState?.name ? locationState : {}),
    },
    async () => {},
  )

  const createTokenMutation = useCreateToken({
    onSuccess: (response: any, variables: any) => {
      clearForm()
      navigate(Path.apiTokens.display.replace(':tokenId', String(response.data.id)), {
        state: {
          token: response.data.token,
          name: formData.name,
          ipRestrictions: variables.ipRestrictions,
        },
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : t('api_tokens:create_error', 'Failed to create token')
      toast.error(message)
    },
  })

  const handleNext = () => {
    setActiveStep(1)
  }

  const handleBack = () => {
    setActiveStep(0)
  }

  const handleCancel = () => {
    clearForm()
    navigate(Path.apiTokens.dashboard)
  }

  const handleSubmit = (finalIpRestrictions?: string[]) => {
    const ipsToSubmit =
      finalIpRestrictions !== undefined ? finalIpRestrictions : formData.ipRestrictions
    createTokenMutation.mutate({
      name: formData.name,
      expiresIn: formData.expiresIn,
      abilities: formData.abilities,
      ipRestrictions: ipsToSubmit,
    })
  }

  const stepLabels = [
    {
      title: t('api_tokens:step_basic', 'Configuration'),
      subtitle: t('api_tokens:step_basic_sub', 'Name & Scopes'),
    },
    {
      title: t('api_tokens:step_restrictions', 'Restrictions'),
      subtitle: t('api_tokens:step_restrictions_sub', 'IP Whitelisting & CIDR'),
    },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' sx={{ color: 'text.disabled' }} />}
        sx={{ mb: 4 }}
      >
        <Link
          underline='hover'
          color='text.secondary'
          onClick={() => navigate(Path.apiTokens.dashboard)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600 }}
        >
          {t('api_tokens:title', 'API Tokens')}
        </Link>
        <Typography color='text.primary' sx={{ fontWeight: 800 }}>
          {t('api_tokens:create_title', 'Create New Token')}
        </Typography>
      </Breadcrumbs>

      {/* Header & Goal-Gradient Progress */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h3' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
            {t('api_tokens:create_header', 'Create API Token')}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.05rem' }}>
            {t(
              'api_tokens:create_subheader',
              'Configure authentication and permissions for your integrations.',
            )}
          </Typography>
        </Box>

        {/* Step Indicator Pill */}
        <Chip
          label={t('api_tokens:step_indicator', {
            current: activeStep + 1,
            total: stepLabels.length,
            defaultValue: `Step ${activeStep + 1} of ${stepLabels.length}`,
          })}
          sx={{
            fontWeight: stepperTokens.progress.badgeFontWeight,
            fontSize: stepperTokens.progress.badgeFontSize,
            borderRadius: stepperTokens.progress.badgeBorderRadius,
            letterSpacing: stepperTokens.progress.stepIndicatorLetterSpacing,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            px: 1,
            py: 0.5,
          }}
        />
      </Box>

      {/* Stepper (Goal-Gradient Effect) */}
      <Box sx={{ mb: 5 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepConnector-line': {
              borderBlockStartWidth: stepperTokens.connector.borderBlockStartWidth,
              borderRadius: stepperTokens.connector.borderRadius,
            },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line':
              {
                borderColor: theme.palette.primary.main,
              },
          }}
        >
          {stepLabels.map((step, idx) => (
            <Step key={step.title} completed={activeStep > idx}>
              <StepLabel>
                <Typography
                  sx={{
                    fontWeight: activeStep === idx ? 800 : 600,
                    color: activeStep === idx ? 'text.primary' : 'text.disabled',
                  }}
                >
                  {step.title}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                  {step.subtitle}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Wizard Step Render */}
      {activeStep === 0 ? (
        <CreateAPITokenBasicInfo
          isWizard={true}
          formData={formData}
          onUpdate={(updates: Partial<APITokenDraftForm>) =>
            setFormData((prev: APITokenDraftForm) => ({ ...prev, ...updates }))
          }
          onNext={handleNext}
          onCancel={handleCancel}
        />
      ) : (
        <CreateAPITokenIPRestrictions
          isWizard={true}
          formData={formData}
          onUpdate={(updates: { ipRestrictions: string[] }) =>
            setFormData((prev: APITokenDraftForm) => ({ ...prev, ...updates }))
          }
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={createTokenMutation.isPending}
        />
      )}
    </Box>
  )
}

export default CreateAPITokenWizard
