import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItemIcon,
  Menu,
  Stack,
  Tooltip,
  Typography,
  Divider,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next'
import { useAuth } from '@cap/platform-core'
import { UserDto } from '@cap/shared-types'
import { useSignout } from "@auth/authentication-core/hooks/useAuthQuery"
import { Path } from '@cap/module-auth/routes';

const Profile: React.FC<{ user: UserDto }> = ({ user }) => (
  <Stack direction='column'>
    <Stack
      direction='row'
      spacing={2}
      justifyContent='start'
      alignItems='center'
      sx={{
        px: 2,
        py: 1.5,
      }}
    >
      <Avatar
        variant='circular'
        src={user?.avatar || undefined}
        alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
        sx={{
          width: 40,
          height: 40,
        }}
      />
      <Stack direction='column'>
        <Typography variant='body1' sx={{ fontWeight: 600 }} noWrap>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant='body2' color='text.secondary' noWrap>
          {user?.email}
        </Typography>
      </Stack>
    </Stack>
    <Divider />
  </Stack>
)

const AuthProfile = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user: authUser, signOut: zustandSignOut } = useAuth()

  const { mutate: logout, isPending } = useSignout({
    onSuccess: () => {
      zustandSignOut()
      navigate(Path.auth.signin, { replace: true })
    },
    onError: () => {
      // Even on error, clear local state
      zustandSignOut()
      navigate(Path.auth.signin, { replace: true })
    },
  })

  // Extract user data from IAuth structure
  const user = authUser?.user

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  if (!user) {
    return null
  }

  const settingsItems = [
    {
      icon: <Settings fontSize='small' />,
      name: t('auth.profile.settings'),
      link: 'settings',
    },
  ]

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title={t('auth.profile.tooltip')}>
          <IconButton
            onClick={handleClick}
            size='small'
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
              src={user?.avatar || undefined}
              sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.light' }}
            />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Profile user={user} />
        <List sx={{ pt: 0, pb: 0 }}>
          {settingsItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                navigate(`/${item.link}`)
                handleClose()
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: (theme) => theme.spacing(5) }}>
                {item.icon}
              </ListItemIcon>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {item.name}
              </Typography>
            </MenuItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ px: 2, pb: 1, pt: 0.5 }}>
          <Button
            fullWidth
            variant='contained'
            color='error'
            disabled={isPending}
            size='small'
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
            endIcon={
              isPending ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <Logout fontSize='small' />
              )
            }
            onClick={() => {
              handleClose()
              logout()
            }}
          >
            {isPending ? t('auth.profile.signing_out') : t('auth.profile.logout')}
          </Button>
        </Box>
      </Menu>
    </React.Fragment>
  )
}

export default AuthProfile



