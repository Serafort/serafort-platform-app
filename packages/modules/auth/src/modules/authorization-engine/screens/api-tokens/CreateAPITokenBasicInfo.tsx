import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Select,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Stack,
  Skeleton,
  Alert,
  alpha,
  useTheme,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SecurityIcon from '@mui/icons-material/Security'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useScopes } from '@auth/authorization-engine/hooks/useAdminQuery'
import type { AuthScope } from '@auth/authorization-engine/services/adminService'
import { Path } from '@auth/routes/path'

export interface CreateAPITokenBasicInfoProps {
  isWizard?: boolean
  formData?: {
    name: string
    expiresIn: string
    abilities: string[]
  }
  onUpdate?: (updates: { name?: string; expiresIn?: string; abilities?: string[] }) => void
  onNext?: () => void
  onCancel?: () => void
}

const CreateAPITokenBasicInfo: React.FC<CreateAPITokenBasicInfoProps> = ({
  isWizard = false,
  formData,
  onUpdate,
  onNext,
  onCancel,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const prevState = location.state as {
    name?: string
    expiresIn?: string
    abilities?: string[]
  } | null
  const [localTokenName, setLocalTokenName] = useState(prevState?.name || '')
  const [localExpiration, setLocalExpiration] = useState(prevState?.expiresIn || '30 days')
  const [localSelectedScopes, setLocalSelectedScopes] = useState<string[]>(
    prevState?.abilities || [],
  )

  const tokenName = isWizard && formData ? formData.name : localTokenName
  const expiration = isWizard && formData ? formData.expiresIn : localExpiration
  const selectedScopes = isWizard && formData ? formData.abilities : localSelectedScopes

  // Fetch scopes from backend
  const {
    data: scopesResponse,
    isLoading: scopesLoading,
    isError: scopesError,
    refetch: refetchScopes,
  } = useScopes()

  const scopes = useMemo(() => {
    if (!scopesResponse?.data) return []
    const raw = Array.isArray(scopesResponse.data) ? scopesResponse.data : []
    return raw.map((s: AuthScope) => ({
      id: s.name,
      label: s.displayName || s.name,
      description: s.description || '',
    }))
  }, [scopesResponse])

  const setTokenName = (val: string) => {
    if (isWizard && onUpdate) {
      onUpdate({ name: val })
    } else {
      setLocalTokenName(val)
    }
  }

  const setExpiration = (val: string) => {
    if (isWizard && onUpdate) {
      onUpdate({ expiresIn: val })
    } else {
      setLocalExpiration(val)
    }
  }

  const handleToggleScope = (id: string) => {
    const nextScopes = selectedScopes.includes(id)
      ? selectedScopes.filter((s) => s !== id)
      : [...selectedScopes, id]
    if (isWizard && onUpdate) {
      onUpdate({ abilities: nextScopes })
    } else {
      setLocalSelectedScopes(nextScopes)
    }
  }

  const handleNext = () => {
    if (isWizard && onNext) {
      onNext()
    } else {
      navigate(Path.apiTokens.createRestrictions, {
        state: { name: tokenName, expiresIn: expiration, abilities: selectedScopes },
      })
    }
  }

  const handleCancelClick = () => {
    if (isWizard && onCancel) {
      onCancel()
    } else {
      navigate(Path.apiTokens.dashboard)
    }
  }

  return (
    <Box sx={isWizard ? { width: '100%' } : { p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
      {/* Breadcrumbs (only in standalone mode) */}
      {!isWizard && (
        <>
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

          {/* Header */}
          <Box sx={{ mb: 5 }}>
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

          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={0} alternativeLabel>
              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>
                    {t('api_tokens:step_basic', 'Configuration')}
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 600, color: 'text.disabled' }}>
                    {t('api_tokens:step_restrictions', 'Restrictions')}
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 600, color: 'text.disabled' }}>
                    {t('api_tokens:step_review', 'Deployment')}
                  </Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>
        </>
      )}

      {/* Main Card */}
      <Card
        variant='outlined'
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={4}>
            {/* Left: Basic info */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={3}>
                <Box>
                  <FormLabel
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 1.5,
                      display: 'block',
                      color: 'text.primary',
                    }}
                  >
                    {t('api_tokens:field_name', 'Integration Name')}
                  </FormLabel>
                  <TextField
                    fullWidth
                    placeholder={t('api_tokens:name_placeholder', 'e.g. CI/CD Pipeline')}
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    variant='outlined'
                    autoFocus
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600, height: 52 } } }}
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {t(
                      'api_tokens:name_help',
                      'A unique name to identify this token in your dashboard.',
                    )}
                  </Typography>
                </Box>

                <Box>
                  <FormLabel
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 1.5,
                      display: 'block',
                      color: 'text.primary',
                    }}
                  >
                    {t('api_tokens:field_expiration', 'Expiration Interval')}
                  </FormLabel>
                  <Select
                    fullWidth
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    sx={{ borderRadius: 3, fontWeight: 600, height: 52 }}
                  >
                    <MenuItem value='7 days' sx={{ fontWeight: 600 }}>
                      {t('api_tokens:exp_7d', '7 Days')}
                    </MenuItem>
                    <MenuItem value='30 days' sx={{ fontWeight: 600 }}>
                      {t('api_tokens:exp_30d', '30 Days')}
                    </MenuItem>
                    <MenuItem value='90 days' sx={{ fontWeight: 600 }}>
                      {t('api_tokens:exp_90d', '90 Days')}
                    </MenuItem>
                    <MenuItem value='365 days' sx={{ fontWeight: 600 }}>
                      {t('api_tokens:exp_1y', '1 Year')}
                    </MenuItem>
                    <MenuItem value='never' sx={{ fontWeight: 600, color: 'error.main' }}>
                      {t('api_tokens:exp_never', 'No Expiration')}
                    </MenuItem>
                  </Select>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {t('api_tokens:exp_help', 'Shorter expiration is more secure.')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Right: Scopes */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <SecurityIcon color='primary' sx={{ fontSize: 24 }} />
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {t('api_tokens:permissions_title', 'Access Scopes')}
                </Typography>
              </Box>

              {/* Scopes loading state */}
              {scopesLoading && (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant='rounded' height={56} sx={{ borderRadius: 3 }} />
                  ))}
                </Stack>
              )}

              {/* Scopes error state */}
              {scopesError && (
                <Alert
                  severity='error'
                  action={
                    <Button
                      startIcon={<RefreshIcon />}
                      color='inherit'
                      size='small'
                      onClick={() => refetchScopes()}
                      sx={{ fontWeight: 700, textTransform: 'none' }}
                    >
                      {t('common:retry', 'Retry')}
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {t('api_tokens:scopes_load_error', 'Failed to load available scopes.')}
                </Alert>
              )}

              {/* Scopes list */}
              {!scopesLoading && !scopesError && (
                <>
                  <Stack spacing={1.5}>
                    {scopes.map((scope) => {
                      const isSelected = selectedScopes.includes(scope.id)
                      return (
                        <Paper
                          key={scope.id}
                          variant='outlined'
                          component='div'
                          role='button'
                          aria-pressed={isSelected}
                          tabIndex={0}
                          onClick={() => handleToggleScope(scope.id)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault()
                              handleToggleScope(scope.id)
                            }
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected
                              ? alpha(theme.palette.primary.main, 0.04)
                              : 'background.paper',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : 'primary.light',
                              transform: 'translateX(4px)',
                              bgcolor: isSelected
                                ? alpha(theme.palette.primary.main, 0.08)
                                : alpha(theme.palette.primary.main, 0.02),
                            },
                            '&:focus-visible': {
                              outline: `2px solid ${theme.palette.primary.main}`,
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Checkbox
                              checked={isSelected}
                              size='small'
                              tabIndex={-1}
                              aria-hidden='true'
                              sx={{ p: 0.5, mt: -0.25 }}
                            />
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 800, mb: 0.25 }}>
                                {scope.label}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ fontWeight: 500 }}
                              >
                                {scope.description}
                              </Typography>
                            </Box>
                          </Box>
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: 4,
                                bgcolor: 'primary.main',
                              }}
                            />
                          )}
                        </Paper>
                      )
                    })}
                  </Stack>

                  {selectedScopes.length === 0 && (
                    <Typography
                      variant='caption'
                      color='error'
                      sx={{ mt: 2, display: 'block', fontWeight: 600 }}
                    >
                      {t('api_tokens:scope_required', 'Select at least one scope to continue.')}
                    </Typography>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>

        {/* Footer Actions */}
        <Box
          sx={{
            px: { xs: 3, md: 5 },
            py: 3,
            bgcolor: (t) => alpha(t.palette.action.hover, 0.4),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(Path.apiTokens.dashboard)}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
            }}
          >
            {t('common:cancel', 'Cancel')}
          </Button>

          <Button
            variant='contained'
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            disabled={
              !tokenName.trim() || selectedScopes.length === 0 || scopesLoading || scopesError
            }
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 3,
              fontWeight: 900,
              textTransform: 'none',
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {t('api_tokens:continue', 'Continue to Restrictions')}
          </Button>
        </Box>
      </Card>
    </Box>
  )
}

export default CreateAPITokenBasicInfo
