import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Card,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import Refresh from '@mui/icons-material/Refresh'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Email from '@mui/icons-material/Email'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Path } from '@cap/module-auth/routes/path'
import { useEmailChanges } from '@auth/user-directory/hooks/useUserQuery'
import { EmailChangeRequest } from '../../types/api.types'

export default function EmailChangeStatus() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: response, isLoading, isError, refetch } = useEmailChanges()
  const requests = response?.data || []

  const getStatusChip = (status: string) => {
    const map: Record<string, any> = {
      completed: { label: t('email.statusCompleted', 'Completed'), color: 'success' },
      pending_authorization: { label: t('email.statusPending', 'Pending Auth'), color: 'warning' },
      expired: { label: t('email.statusExpired', 'Expired'), color: 'error' },
    }
    const cfg = map[status] || { label: status, color: 'default' }
    return <Chip label={cfg.label} color={cfg.color} size='small' variant='outlined' />
  }

  return (
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            variant='square'
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'transparent',
              color: 'primary.main',
              borderRadius: '24px',
              border: '2px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              flexShrink: 0,
            }}
          >
            <Email sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.027em' }}>
              {t('email.statusHeading', 'Email Management')}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('email.statusDescription', 'Track and manage your email address change requests.')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <Tooltip title={t('common.refresh', 'Refresh')}>
            <IconButton
              onClick={() => refetch()}
              disabled={isLoading}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant='contained'
            component={Link}
            to={Path.account.overview}
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: 'info.main',
              boxShadow: (t: any) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`,
              '&:hover': { bgcolor: 'info.dark' },
            }}
          >
            {t('email.newRequest', 'New Request')}
          </Button>
        </Box>
      </Box>

      <Card
        sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}
                  >
                    {t('email.colEmails', 'Email Addresses')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}
                  >
                    {t('email.colDate', 'Date Requested')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}
                  >
                    {t('email.colStatus', 'Status')}
                  </Typography>
                </TableCell>
                <TableCell align='right' />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('common.loading', 'Loading...')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='error'>
                      {t('common.errorLoading', 'Failed to load changes.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('email.noRequests', 'No email change requests found.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !isError &&
                requests.map((request: EmailChangeRequest) => (
                  <TableRow key={request.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {request.newEmail}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {t('email.from', 'from')}: {request.oldEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {request.date}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell align='right'>
                      <IconButton size='small'>
                        <InfoOutlined fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Button
          onClick={() => navigate(Path.account.profile)}
          startIcon={<ArrowBack />}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
        >
          {t('common.backToDashboard', 'Back to Dashboard')}
        </Button>
      </Box>
    </Box>
  )
}
