import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  FormControlLabel,
  Switch,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Path } from '@auth/routes/path'

const APITokenActions: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tokenId } = useParams<{ tokenId: string }>()

  const [tokenName, setTokenName] = useState('Production - Backend API')
  const [notifyOnUsage, setNotifyOnUsage] = useState(true)
  const [autoRevokeOnLeak, setAutoRevokeOnLeak] = useState(true)
  const [revoking, setRevoking] = useState(false)

  const handleSave = () => {
    // Save logic
    navigate(Path.apiTokens.details.replace(':tokenId', tokenId || '1'))
  }

  const handleRevoke = () => {
    setRevoking(true)
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(Path.apiTokens.dashboard)}
          sx={{ cursor: 'pointer' }}
        >
          {t('auth.api_tokens.title', 'API Tokens')}
        </Link>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(Path.apiTokens.details.replace(':tokenId', tokenId || '1'))}
          sx={{ cursor: 'pointer' }}
        >
          {t('auth.api_tokens.details_title', 'Token Details')}
        </Link>
        <Typography color='text.primary'>
          {t('auth.api_tokens.actions_title', 'Manage Token')}
        </Typography>
      </Breadcrumbs>

      <Typography variant='h4' fontWeight='bold' gutterBottom>
        {t('auth.api_tokens.manage_header', 'Manage Token Settings')}
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        {t(
          'auth.api_tokens.manage_subheader',
          'Update configuration and security settings for this token.',
        )}
      </Typography>

      <Card variant='outlined' sx={{ borderRadius: 'var(--sf-radius-lg, 16px)', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
            {t('auth.api_tokens.general_settings', 'General Settings')}
          </Typography>
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant='body2' fontWeight='bold' gutterBottom>
              {t('auth.api_tokens.field_name', 'Token Name')}
            </Typography>
            <TextField
              fullWidth
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              variant='outlined'
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' } }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant='subtitle1'
            fontWeight='bold'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
            {t('auth.api_tokens.security_automation', 'Security & Automation')}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifyOnUsage}
                  onChange={(e) => setNotifyOnUsage(e.target.checked)}
                  color='primary'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight='bold'>
                    {t('auth.api_tokens.notify_usage', 'Email notification on new IP usage')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {t(
                      'auth.api_tokens.notify_usage_desc',
                      'Get alerted whenever this token is used from a new IP address.',
                    )}
                  </Typography>
                </Box>
              }
              sx={{ mb: 3, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={autoRevokeOnLeak}
                  onChange={(e) => setAutoRevokeOnLeak(e.target.checked)}
                  color='error'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight='bold'>
                    {t('auth.api_tokens.auto_revoke', 'Automatic revocation on leak detection')}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {t(
                      'auth.api_tokens.auto_revoke_desc',
                      'Automatically revoke the token if it is detected in public repositories (e.g. GitHub).',
                    )}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>
        </CardContent>
        <Box
          sx={{
            px: 4,
            py: 2,
            bgcolor: 'action.hover',
            borderBottomLeftRadius: 'var(--sf-radius-lg, 16px)',
            borderBottomRightRadius: 'var(--sf-radius-lg, 16px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant='contained'
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700 }}
          >
            {t('auth.common.saveChanges', 'Save Changes')}
          </Button>
        </Box>
      </Card>

      <Card variant='outlined' sx={{ borderRadius: 'var(--sf-radius-lg, 16px)', borderColor: 'error.main' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
            color='error'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            {t('auth.api_tokens.danger_zone', 'Danger Zone')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {t(
              'auth.api_tokens.danger_zone_desc',
              'Once revoked, this token will immediately stop working and cannot be restored.',
            )}
          </Typography>
          <Button
            variant='outlined'
            color='error'
            fullWidth
            onClick={handleRevoke}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700 }}
          >
            {t('auth.api_tokens.revoke_token_now', 'Revoke this Token')}
          </Button>
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revoking}
        onClose={() => setRevoking(false)}
        PaperProps={{ sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } }}
      >
        <DialogTitle>{t('auth.api_tokens.revoke_confirm_title', 'Revoke API Token?')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'auth.api_tokens.revoke_confirm_msg',
              'Are you sure you want to revoke "{name}"? Applications using this token will immediately fail to authenticate.',
              { name: tokenName },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRevoking(false)} sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700 }}>
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setRevoking(false)
              navigate(Path.apiTokens.dashboard)
            }}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 700 }}
          >
            {t('auth.common.revokePermanently', 'Revoke Permanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default APITokenActions
