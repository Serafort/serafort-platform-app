import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Paper,
  Tooltip,
  Grid,
  alpha,
  useTheme,
  Alert,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import LanguageIcon from '@mui/icons-material/Language'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ShieldIcon from '@mui/icons-material/Shield'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useCreateToken } from "@auth/user-directory/hooks/useUserQuery"
import { Path } from "@auth/routes/path"

interface CreateTokenState {
  name: string
  abilities: string[]
  expiresIn: string
}

const CreateAPITokenIPRestrictions: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  // Use state from navigation or default to empty values
  const state = (location.state as CreateTokenState) || {
    name: '',
    abilities: [],
    expiresIn: '30 days',
  }
  const isMissingState = !state.name

  const [ipInput, setIpInput] = useState('')
  const [ipError, setIpError] = useState(false)
  const [ipList, setIpList] = useState<string[]>([])

  const validateIP = (ip: string) => {
    // Basic IPv4 or CIDR regex
    const regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
    return regex.test(ip)
  }

  const handleAddIP = () => {
    const trimmed = ipInput.trim()
    if (!trimmed) return

    if (!validateIP(trimmed)) {
      setIpError(true)
      toast.error(t('api_tokens:invalid_ip_format', 'Invalid IP or CIDR format'), {  })
      return
    }

    if (ipList.includes(trimmed)) {
      toast.warning(t('api_tokens:ip_already_added', 'IP already in whitelist'), {  })
      return
    }

    setIpList([...ipList, trimmed])
    setIpInput('')
    setIpError(false)
  }

  const handleInputChange = (val: string) => {
    // Basic filter: only allow numbers, dots, and slashes
    const filtered = val.replace(/[^0-9./]/g, '')
    setIpInput(filtered)
    if (ipError) setIpError(false)
  }

  const createTokenMutation = useCreateToken({
    onSuccess: (response: any, variables: any) => {
      navigate(Path.apiTokens.display.replace(':tokenId', String(response.data.id)), {
        state: {
          token: response.data.token,
          name: state?.name,
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

  const handleRemoveIP = (ip: string) => {
    setIpList(ipList.filter((item) => item !== ip))
  }

  const onCreateToken = () => {
    if (state?.name) {
      createTokenMutation.mutate({
        name: state.name,
        expiresIn: state.expiresIn,
        abilities: state.abilities,
        ipRestrictions: ipList,
      })
    }
  }

  const onSkipRestrictions = () => {
    if (state?.name) {
      createTokenMutation.mutate({
        name: state.name,
        expiresIn: state.expiresIn,
        abilities: state.abilities,
        ipRestrictions: [], // Explicitly skip
      })
    }
  }

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

      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant='h3' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('api_tokens:restrictions_header', 'Network Security')}
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.05rem' }}>
          {t(
            'api_tokens:restrictions_subheader',
            'Enhance security by restricting API calls to specific originating IP addresses.',
          )}
        </Typography>
      </Box>

      {/* Warning if state is missing */}
      {isMissingState && (
        <Alert
          severity='warning'
          variant='outlined'
          sx={{ mb: 4, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => navigate(Path.apiTokens.createBasic)}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {t('api_tokens:go_back_config', 'Go back to step 1')}
            </Button>
          }
        >
          {t(
            'api_tokens:config_state_lost',
            'Configuration state was lost. Please go back and re-enter the token details.',
          )}
        </Alert>
      )}

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={1} alternativeLabel>
          <Step>
            <StepLabel StepIconComponent={() => <CheckCircleIcon color='success' />}>
              <Typography sx={{ fontWeight: 700, color: 'success.main' }}>
                {t('api_tokens:step_basic', 'Configuration')}
              </Typography>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
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

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            variant='outlined'
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ mb: 4 }}>
                {/* Section header â€” canonical pattern */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <LanguageIcon color='primary' sx={{ fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('api_tokens:ip_whitelist', 'IP Whitelist')}
                  </Typography>
                  <Tooltip
                    title={t(
                      'api_tokens:ip_help',
                      'Support individual IPs (e.g. 1.2.3.4) or CIDR blocks (e.g. 1.2.3.0/24)',
                    )}
                    arrow
                  >
                    <IconButton
                      size='small'
                      aria-label={t('api_tokens:ip_help_label', 'IP format info')}
                      sx={{
                        ml: 'auto',
                        color: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <InfoIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  {t(
                    'api_tokens:ip_whitelist_desc',
                    'Requests from unauthorized IP addresses will be blocked. Leave empty for global access.',
                  )}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder={t('api_tokens:ip_placeholder', 'e.g. 192.168.1.1')}
                    value={ipInput}
                    error={ipError}
                    helperText={ipError ? t('api_tokens:invalid_ip_format') : ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIP()}
                    slotProps={{
                      input: {
                        sx: { borderRadius: 3, fontWeight: 600, height: 52 },
                        inputProps: {
                          pattern: '^(\\d{1,3}\\.){3}\\d{1,3}(\\/\\d{1,2})?$',
                        },
                        startAdornment: (
                          <InputAdornment position='start'>
                            <LanguageIcon
                              fontSize='small'
                              sx={{ color: ipError ? 'error.main' : 'text.disabled' }}
                            />
                          </InputAdornment>
                        ),
                      },
                      formHelperText: {
                        sx: { fontWeight: 600, ml: 0 },
                      },
                    }}
                  />
                  <Button
                    variant='outlined'
                    onClick={handleAddIP}
                    disabled={!ipInput.trim()}
                    sx={{ borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none' }}
                  >
                    {t('common:add', 'Add')}
                  </Button>
                </Box>

                <Paper
                  variant='outlined'
                  sx={{
                    borderRadius: 3,
                    minHeight: 160,
                    maxHeight: 300,
                    overflowY: 'auto',
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  {ipList.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        height: '100%',
                        opacity: 0.6,
                      }}
                    >
                      <LanguageIcon
                        sx={{ fontSize: 48, color: 'text.disabled', mb: 1, transition: '0.3s' }}
                      />
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {t('api_tokens:no_restrictions', 'No restrictions active')}
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 1 }}>
                      {ipList.map((ip, index) => (
                        <ListItem
                          key={ip}
                          sx={{
                            mb: index === ipList.length - 1 ? 0 : 1,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            boxShadow: 'none',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <ListItemText
                            primary={ip}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge='end'
                              onClick={() => handleRemoveIP(ip)}
                              color='error'
                              aria-label={t('common:remove', 'Remove')}
                              sx={{
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Box>
            </CardContent>

            {/* Footer Action Bar */}
            <Box
              sx={{
                px: { xs: 3, md: 5 },
                py: 3,
                bgcolor: alpha(theme.palette.action.hover, 0.4),
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
                onClick={() => navigate(Path.apiTokens.createBasic, { state })}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                }}
              >
                {t('common:back', 'Change Details')}
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='text'
                  onClick={onSkipRestrictions}
                  disabled={createTokenMutation.isPending || isMissingState}
                  sx={{ fontWeight: 800, textTransform: 'none', color: 'text.primary' }}
                >
                  {t('api_tokens:skip_restrictions', 'Skip for now')}
                </Button>
                <Button
                  variant='contained'
                  endIcon={<NavigateNextIcon />}
                  onClick={onCreateToken}
                  loading={createTokenMutation.isPending}
                  disabled={isMissingState}
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
                  {t('api_tokens:generate_token', 'Generate API Token')}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Side Panel â€” Security Tips */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              height: 'fit-content',
              position: 'sticky',
              top: 24,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <ShieldIcon sx={{ color: 'warning.dark' }} />
              <Typography variant='subtitle1' sx={{ fontWeight: 800, color: 'warning.dark' }}>
                {t('api_tokens:security_warning_title', 'Security Best Practices')}
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ color: 'warning.dark', lineHeight: 1.6, fontWeight: 500 }}
            >
              {t(
                'api_tokens:security_warning_msg',
                'In production environments, we strongly recommend whitelisting the IP addresses of the servers that will be making requests. This prevents unauthorized access even if the token is leaked.',
              )}
            </Typography>
            <Divider sx={{ my: 2.5, opacity: 0.5 }} />
            <Typography
              variant='caption'
              sx={{
                color: 'warning.dark',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.075em',
                display: 'block',
                mb: 1,
              }}
            >
              {t('api_tokens:quick_tip', 'Quick Tips:')}
            </Typography>
            <Box
              component='ul'
              sx={{
                m: 0,
                pl: 2,
                color: 'warning.dark',
                fontSize: '0.75rem',
                fontWeight: 500,
                '& li': { mb: 0.5 },
              }}
            >
              <li>{t('api_tokens:tip_1', 'Use CIDR notation for subnet blocks')}</li>
              <li>{t('api_tokens:tip_2', 'Always use HTTPS for your requests')}</li>
              <li>{t('api_tokens:tip_3', 'Rotate your keys regularly')}</li>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateAPITokenIPRestrictions
