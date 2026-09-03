import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, AlertTitle, Paper, IconButton, Tooltip, Stepper, Step, StepLabel, Divider, Grid, Chip, Skeleton } from '@mui/material';
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TerminalIcon from '@mui/icons-material/Terminal';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShieldIcon from '@mui/icons-material/Shield';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { alpha, useTheme } from '@mui/material/styles';
import { useUserTokens } from '@auth/user-directory/hooks/useUserQuery';
import { Path } from '@auth/routes/path';

interface DisplayState {
  token: string
  name: string
  ipRestrictions?: string[]
}

const APITokenDisplayUsage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { tokenId } = useParams<{ tokenId: string }>()
  const theme = useTheme()

  const state = location.state as DisplayState
  const [copied, setCopied] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  // Receive generated token from creation step (may be empty if viewing as usage guide)
  const generatedToken = state?.token || ''
  const tokenName = state?.name || ''
  const hasToken = Boolean(generatedToken)

  // Fetch token details for standalone usage guide mode
  const { data: tokensResponse, isLoading: isLoadingToken } = useUserTokens({
    enabled: !hasToken && Boolean(tokenId),
  })

  const tokenDetails = useMemo(() => {
    if (hasToken || !tokensResponse?.data || !tokenId) return undefined
    const tokens = Array.isArray(tokensResponse.data) ? tokensResponse.data : []
    return tokens.find((tk: any) => String(tk.id) === tokenId)
  }, [tokensResponse, tokenId, hasToken])

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return t('common:never', 'Never')
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken)
      setCopied(true)
      toast.success(t('api_tokens:token_copied', 'Token copied to clipboard!'), {  })
      setTimeout(() => setCopied(false), 5173)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('api_tokens:copy_failed', 'Failed to copy token')
      toast.error(message)
    }
  }

  const handleDone = () => {
    navigate(Path.apiTokens.dashboard)
  }

  const maskedToken = generatedToken.replace(/.(?=.{4})/g, 'â€¢')
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.yourapp.com'

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!hasToken && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                if (tokenId) {
                  navigate(Path.apiTokens.details.replace(':tokenId', tokenId))
                } else {
                  handleDone()
                }
              }}
              sx={{
                p: 0,
                minWidth: 'auto',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            />
          )}
          {hasToken && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main' }} />
            </Box>
          )}
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 800 }}>
              {hasToken
                ? t('api_tokens:display_header', 'Token Generated Successfully!')
                : t('api_tokens:usage_guide_header', 'API Token Usage Guide')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {hasToken
                ? t(
                    'api_tokens:display_subheader',
                    "Make sure to copy your API token now. You won't be able to see it again!",
                  )
                : t(
                    'api_tokens:usage_guide_subheader',
                    'Learn how to authenticate your API requests using tokens.',
                  )}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          {hasToken && (
            <Button
              variant='outlined'
              endIcon={<ArrowForwardIcon />}
              onClick={handleDone}
              sx={{ fontWeight: 700, textTransform: 'none', height: 44, px: 3 }}
            >
              {t('api_tokens:go_to_dashboard', 'Go to Dashboard')}
            </Button>
          )}
          {!hasToken && (
            <Button
              variant='outlined'
              onClick={handleDone}
              sx={{ fontWeight: 700, textTransform: 'none', height: 44, px: 3 }}
            >
              {t('common:back_to_dashboard', 'â† Back to Dashboard')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Stepper â€” only show after token creation */}
      {hasToken && (
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={2} alternativeLabel>
            <Step>
              <StepLabel StepIconComponent={() => <CheckCircleIcon color='success' />}>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>
                  {t('api_tokens:step_basic', 'Configuration')}
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconComponent={() => <CheckCircleIcon color='success' />}>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>
                  {t('api_tokens:step_restrictions', 'Restrictions')}
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>
                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {t('api_tokens:step_review', 'Deployment')}
                </Typography>
              </StepLabel>
            </Step>
          </Stepper>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Main Content */}
        <Grid size={{ xs: 12, md: hasToken ? 8 : 12 }}>
          {/* Security Warning + Token Card â€” only after creation */}
          {hasToken && (
            <>
              <Alert severity='warning' sx={{ mb: 3 }}>
                <AlertTitle sx={{ fontWeight: 800 }}>
                  {t('api_tokens:security_alert_title', 'Crucial Security Warning')}
                </AlertTitle>
                {t(
                  'api_tokens:security_alert_msg',
                  'For your security, we only show this token once. Store it in a secure password manager or environment variable.',
                )}
              </Alert>

              {/* Token Display Card */}
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <SecurityIcon color='primary' sx={{ fontSize: 24 }} />
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {t('api_tokens:your_new_token', 'Your New API Token')}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 140, mb: 2 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('api_tokens:token_name_label', 'Token Name')}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {tokenName}
                    </Typography>
                  </Box>

                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: alpha(theme.palette.action.hover, 0.3),
                      borderRadius: 2,
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                      wordBreak: 'break-all',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ flexGrow: 1, mr: 2, fontWeight: 600 }}>
                      {showSecret ? generatedToken : maskedToken}
                    </Box>
                    <Box sx={{ display: 'flex', flexShrink: 0 }}>
                      <Tooltip
                        title={showSecret ? t('common:hide', 'Hide') : t('common:show', 'Show')}
                      >
                        <IconButton
                          size='small'
                          onClick={() => setShowSecret(!showSecret)}
                          aria-label={
                            showSecret ? t('common:hide', 'Hide') : t('common:show', 'Show')
                          }
                          sx={{ mr: 0.5 }}
                        >
                          {showSecret ? (
                            <VisibilityOffIcon fontSize='small' />
                          ) : (
                            <VisibilityIcon fontSize='small' />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={copied ? t('common:copied', 'Copied!') : t('common:copy', 'Copy')}
                      >
                        <IconButton
                          size='small'
                          onClick={handleCopy}
                          color={copied ? 'success' : 'primary'}
                          aria-label={t('common:copy', 'Copy')}
                        >
                          {copied ? <CheckIcon fontSize='small' /> : <CopyIcon fontSize='small' />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                  {state.ipRestrictions && state.ipRestrictions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        {t('api_tokens:restriction_summary', 'IP Restrictions')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {state.ipRestrictions.map((ip: string) => (
                          <Chip
                            key={ip}
                            label={ip}
                            size='small'
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              height: 20,
                              bgcolor: alpha(theme.palette.secondary.main, 0.08),
                              color: 'secondary.main',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.secondary.main, 0.2),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                {/* Card footer â€” canonical */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant='contained'
                    size='large'
                    onClick={handleCopy}
                    startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                    color={copied ? 'success' : 'primary'}
                    sx={{
                      px: 5,
                      fontWeight: 700,
                      textTransform: 'none',
                      height: 44,
                      boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                    }}
                  >
                    {copied
                      ? t('api_tokens:copied_token', 'Copied!')
                      : t('api_tokens:copy_token', 'Copy Token to Clipboard')}
                  </Button>
                </Box>
              </Card>

              {/* Done button */}
              <Button
                fullWidth
                variant='outlined'
                size='large'
                endIcon={<ArrowForwardIcon />}
                onClick={handleDone}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t('api_tokens:done_and_dashboard', 'I have copied it, take me to Dashboard')}
              </Button>
            </>
          )}

          {/* Token Info Card â€” standalone usage guide mode */}
          {!hasToken && (
            <>
              {isLoadingToken && (
                <Skeleton variant='rounded' height={200} sx={{ borderRadius: 2, mb: 3 }} />
              )}
              {tokenDetails && (
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Section header â€” canonical */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <VpnKeyIcon color='primary' sx={{ fontSize: 24 }} />
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {tokenDetails.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Chip
                        label={
                          tokenDetails.status === 'active'
                            ? t('common:active', 'Active')
                            : t('common:expired', 'Expired')
                        }
                        color={tokenDetails.status === 'active' ? 'success' : 'default'}
                        size='small'
                        variant='outlined'
                        sx={{ fontWeight: 700, height: 20 }}
                      />
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                        ID: {tokenDetails.id}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3, opacity: 0.5 }} />

                    {/* Dates â€” canonical metadata labels */}
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ minWidth: 140 }}>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.075em',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('api_tokens:created_at', 'Created')}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 800, color: 'text.primary' }}
                          >
                            {formatDate(tokenDetails.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ minWidth: 140 }}>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.075em',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('api_tokens:last_used', 'Last Used')}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 800, color: 'text.primary' }}
                          >
                            {formatDate(tokenDetails.lastUsedAt)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Abilities â€” canonical permission chips */}
                    {tokenDetails.abilities && tokenDetails.abilities.length > 0 && (
                      <>
                        <Divider sx={{ my: 3, opacity: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <ShieldIcon color='primary' sx={{ fontSize: 24 }} />
                          <Typography
                            variant='h6'
                            sx={{
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {t('api_tokens:permissions', 'Permissions')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {tokenDetails.abilities.map((ability: string) => (
                            <Chip
                              key={ability}
                              label={ability}
                              size='small'
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                    {/* IP Restrictions â€” canonical */}
                    {tokenDetails.ipRestrictions && tokenDetails.ipRestrictions.length > 0 && (
                      <>
                        <Divider sx={{ my: 3, opacity: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <SecurityIcon color='primary' sx={{ fontSize: 24 }} />
                          <Typography
                            variant='h6'
                            sx={{
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {t('api_tokens:allowed_ips', 'Allowed IPs')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {tokenDetails.ipRestrictions.map((ip: string) => (
                            <Chip
                              key={ip}
                              label={ip}
                              size='small'
                              variant='outlined'
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 20,
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Grid>

        {/* Right Column: Usage Guide */}
        <Grid size={{ xs: 12, md: hasToken ? 4 : 12 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: 'fit-content',
              position: 'sticky',
              top: 24,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Section header â€” canonical */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TerminalIcon color='primary' sx={{ fontSize: 24 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('api_tokens:how_to_use', 'How to use this token')}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
                {t(
                  'api_tokens:usage_desc',
                  'Include this token in the Authorization header of your API requests.',
                )}
              </Typography>

              <Paper
                variant='outlined'
                sx={{
                  p: 2.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.900',
                  color: 'grey.100',
                  borderRadius: 2,
                  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.7,
                  overflow: 'auto',
                }}
              >
                <Box component='pre' sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
                  {`curl -X GET \\
  ${apiBaseUrl}/api/user/me \\
  -H "Authorization: Bearer ${hasToken ? generatedToken.substring(0, 12) + '...' : 'YOUR_TOKEN_HERE'}" \\
  -H "Content-Type: application/json"`}
                </Box>
              </Paper>

              <Divider sx={{ my: 3, opacity: 0.5 }} />

              {/* Info / Tip Callout â€” canonical */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.1),
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    color: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <InfoIcon fontSize='small' />
                  {t('api_tokens:quick_tip', 'Quick Tips')}
                </Typography>
                <Box
                  component='ul'
                  sx={{
                    m: 0,
                    pl: 2,
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '& li': { mb: 0.75 },
                  }}
                >
                  <li>
                    {t('api_tokens:tip_env', 'Store in .env, never commit to source control')}
                  </li>
                  <li>{t('api_tokens:tip_2', 'Always use HTTPS for your requests')}</li>
                  <li>{t('api_tokens:tip_3', 'Rotate your keys regularly')}</li>
                </Box>
              </Box>
            </CardContent>

            {/* Card footer â€” canonical */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                bgcolor: alpha(theme.palette.action.hover, 0.3),
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button
                startIcon={<SecurityIcon />}
                variant='text'
                size='small'
                onClick={() => navigate(Path.apiTokens.securityWarning)}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                {t('api_tokens:view_security_guide', 'View Token Security Guide')}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default APITokenDisplayUsage
