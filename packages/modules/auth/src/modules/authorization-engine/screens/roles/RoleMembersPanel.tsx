import React, { useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Business from '@mui/icons-material/Business'
import Group from '@mui/icons-material/Group'
import Public from '@mui/icons-material/Public'
import Search from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { Path } from '@auth/routes/path'
import { useRoleMembers } from '@auth/authorization-engine/hooks/useAdminQuery'
import type { RoleMember } from '@auth/authorization-engine/services/adminService'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

interface RoleMembersPanelProps {
  roleId: string
}

const displayName = (user: RoleMember['user']) =>
  [user.firstname, user.lastname].filter(Boolean).join(' ').trim() || user.email

const initials = (user: RoleMember['user']) =>
  (displayName(user)
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2) || '?'
  ).toUpperCase()

/**
 * The "Active members" tab of a role: everyone holding the role, whether as
 * their own platform role or through an organization membership. Its total
 * matches the "N members" count in the role header (same backend source).
 */
export default function RoleMembersPanel({ roleId }: RoleMembersPanelProps) {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [search] = useDebounce(searchTerm.trim(), 400)

  const { data, isLoading, isError, isFetching, refetch } = useRoleMembers(roleId, {
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
  })

  const members = data?.data?.data ?? []
  const total = data?.data?.meta?.total ?? 0

  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(value))
      : null

  const renderBody = () => {
    if (isLoading) {
      return (
        <Stack spacing={0} aria-busy='true' sx={{ px: 3, py: 1 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Stack key={i} direction='row' spacing={2} alignItems='center' sx={{ py: 1.5 }}>
              <Skeleton variant='circular' width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width='30%' />
                <Skeleton width='45%' />
              </Box>
              <Skeleton variant='rounded' width={120} height={24} />
            </Stack>
          ))}
        </Stack>
      )
    }

    if (isError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert
            severity='error'
            action={
              <Button color='inherit' size='small' onClick={() => refetch()}>
                {t('auth.common.retry')}
              </Button>
            }
          >
            {t('auth.admin.roleMembersLoadError')}
          </Alert>
        </Box>
      )
    }

    if (members.length === 0) {
      return (
        <Box sx={{ p: { xs: 4, md: 10 }, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'action.hover' }}>
            <Group sx={{ fontSize: 32, color: 'text.disabled' }} />
          </Avatar>
          <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
            {search ? t('auth.common.noResults') : t('auth.admin.noMembersFound')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 320, mx: 'auto', mt: 1 }}>
            {search
              ? t('auth.admin.roleMembersNoMatch', { search })
              : t('auth.admin.noMembersHint')}
          </Typography>
        </Box>
      )
    }

    return (
      <List disablePadding sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 150ms' }}>
        {members.map((member) => {
          const name = displayName(member.user)
          const inactive =
            member.user.isActif === false ||
            (!!member.user.status && member.user.status !== 'ACTIVE')
          const assigned = formatDate(member.assignedAt)
          return (
            <ListItemButton
              key={`${member.scope}:${member.assignmentId}`}
              divider
              onClick={() => navigate(Path.admin.userProfile.replace(':id', member.user.id))}
              aria-label={t('auth.admin.roleMemberOpenProfile', { name })}
              sx={{ px: 3, py: 1.5, minHeight: 64, gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
            >
              <ListItemAvatar sx={{ minWidth: 0 }}>
                <Avatar
                  src={member.user.avatarUrl ?? undefined}
                  alt=''
                  sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}
                >
                  {initials(member.user)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={name}
                secondary={member.user.email !== name ? member.user.email : undefined}
                slotProps={{
                  primary: { sx: { fontWeight: 700 }, noWrap: true },
                  secondary: { noWrap: true },
                }}
                // On phones the chips wrap under the name instead of squeezing it
                sx={{ flex: 1, minWidth: 0, flexBasis: { xs: 'calc(100% - 56px)', sm: 0 } }}
              />
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ flexShrink: 0, flexWrap: 'wrap', rowGap: 1, ps: { xs: 7, sm: 0 } }}
              >
                {inactive && (
                  <Chip
                    size='small'
                    color='warning'
                    variant='outlined'
                    label={t('auth.admin.roleMemberInactive')}
                  />
                )}
                <Chip
                  size='small'
                  variant='outlined'
                  icon={member.scope === 'platform' ? <Public /> : <Business />}
                  label={
                    member.scope === 'platform'
                      ? t('auth.admin.roleMemberScopePlatform')
                      : member.organization?.name || t('auth.admin.roleMemberScopeOrganization')
                  }
                  sx={{ maxWidth: 220 }}
                />
                {assigned && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ minWidth: 96, textAlign: 'end' }}
                  >
                    {t('auth.admin.roleMemberAssigned', { date: assigned })}
                  </Typography>
                )}
              </Stack>
            </ListItemButton>
          )
        })}
      </List>
    )
  }

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 'var(--sf-radius-lg, 16px)',
      }}
    >
      <Box
        sx={{
          p: { xs: 2.5, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
            {t('auth.admin.equippedMembers')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
            {t('auth.admin.equippedMembersDesc')}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            size='small'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder={t('auth.admin.roleMembersSearch')}
            slotProps={{
              htmlInput: { 'aria-label': t('auth.admin.roleMembersSearch') },
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { sm: 340 }, '& .MuiInputBase-root': { minHeight: 44 } }}
          />
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => navigate(Path.admin.users)}
            sx={{
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 800,
              textTransform: 'none',
              minHeight: 44,
              whiteSpace: 'nowrap',
            }}
          >
            {t('auth.admin.assignNewUser')}
          </Button>
        </Stack>
      </Box>

      {renderBody()}

      {!isError && total > ROWS_PER_PAGE_OPTIONS[0] && (
        <TablePagination
          component='div'
          count={total}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value))
            setPage(0)
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage={t('auth.admin.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            t('auth.admin.paginationRange', { from, to, count })
          }
        />
      )}
    </Card>
  )
}
