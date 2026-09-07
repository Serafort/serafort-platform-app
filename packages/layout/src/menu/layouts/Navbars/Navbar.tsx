import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container,
  Toolbar,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Divider,
  Stack,
  Theme,
  useTheme,
  InputBase,
} from '@mui/material'
import MuiAppBar from '@mui/material/AppBar'
import { styled } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import { AuthButtons, AuthProfile } from '../../../components/auth'
import { isObjectEmpty, AppPaths } from '@cap/shared-types'
import { useAuth, useNavigationMenu } from '@cap/platform-core'
import { Logo, ModeDropdown } from '../../shared'
import {
  navbarTokens,
  getSearchBgColor,
  getSearchHoverBgColor,
  getSearchIconColor,
  getSearchInputLeftPadding,
  getMenuIconColor,
} from '@cap/theme'

const AppBar = styled(MuiAppBar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.background.paper,
  maxWidth: navbarTokens.layout.appBarMaxWidth,
  zIndex: theme.zIndex.appBar,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}))

const Search = styled('div')(({ theme }: { theme: Theme }) => ({
  marginRight: navbarTokens.search.marginRight,
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: getSearchBgColor(theme),

  '&:hover': {
    backgroundColor: getSearchHoverBgColor(theme),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(navbarTokens.search.smMarginLeft),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(navbarTokens.search.iconPaddingY, navbarTokens.search.iconPaddingX),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }: { theme: Theme }) => ({
  color: getSearchIconColor(theme),
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: getSearchInputLeftPadding(theme),
    paddingBottom: 0,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: navbarTokens.search.inputWidthSm,
      '&:focus': {
        width: navbarTokens.search.inputWidthFocus,
      },
    },
  },
}))

function SearchBar() {
  const { t } = useTranslation()
  const theme: Theme = useTheme()
  const searchPlaceholder = t('search.input_placeholder', {
    defaultValue: t('common.search', { defaultValue: 'Search…' }),
  })
  const searchAriaLabel = t('search.aria_label', { defaultValue: 'search' })

  return (
    <React.Fragment>
      <Search>
        <SearchIconWrapper>
          <SearchIcon
            sx={{
              color: getSearchIconColor(theme),
            }}
          />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder={searchPlaceholder}
          inputProps={{ 'aria-label': searchAriaLabel }}
        />
      </Search>
      <IconButton
        aria-label={searchAriaLabel}
        sx={{
          display: { lg: 'none', md: 'none', sm: 'none', xs: 'flex' },
        }}
      >
        <Search />
      </IconButton>
    </React.Fragment>
  )
}

export default function NavBar() {
  const { t } = useTranslation()
  const theme: Theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Fetch dynamic navigation links
  const pages = useNavigationMenu('public')
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const translateLabel = (label?: string) => {
    if (!label) return ''
    const clean = label.replace(/^navigation\./, '')
    const tVal = t(label, { defaultValue: '' })
    if (tVal && tVal !== label) return tVal
    const tClean = t(`navigation.${clean}`, { defaultValue: '' })
    if (tClean && tClean !== `navigation.${clean}`) return tClean
    const tLanding = t(`landing.${clean}`, { defaultValue: '' })
    if (tLanding && tLanding !== `landing.${clean}`) return tLanding
    return clean
  }

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <AppBar position='static'>
      <Container
        maxWidth='xl'
        sx={{
          width: '100%',
          mx: 0,
          pt: navbarTokens.layout.containerPt,
        }}
      >
        <Toolbar disableGutters>
          <Box
            sx={{
              display: { lg: 'flex', md: 'flex', sm: 'flex', xs: 'none' },
              margin: '0px',
              padding: '0px',
              alignItems: 'center',
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              marginLeft: navbarTokens.layout.menuMarginLeft,
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            {pages?.map((page) => {
              const targetPath = page?.path
                ? page.path.startsWith('/')
                  ? page.path
                  : `/${page.path}`
                : '/'
              const isSelected = location.pathname === targetPath
              return (
                <List key={page.id} onClick={handleCloseNavMenu}>
                  <ListItemButton
                    key={page.id}
                    selected={isSelected}
                    sx={{
                      '&.MuiListItemButton-root.Mui-selected': {
                        borderRight: `${navbarTokens.layout.selectedBorderWidth} solid ${theme.palette.background.paper}`,
                        zIndex: navbarTokens.layout.zIndexOffset,
                      },
                    }}
                    onClick={() => {
                      navigate(targetPath, { state: { from: location } })
                    }}
                  >
                    <ListItemText
                      style={{
                        textDecoration: 'none',
                        color: theme.palette.primary.main,
                      }}
                      primary={translateLabel(page?.label)}
                    />
                  </ListItemButton>
                </List>
              )
            })}
          </Box>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <IconButton
              size='large'
              aria-label='Open main menu'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
              color='inherit'
            >
              <MenuIcon
                sx={{
                  color: getMenuIconColor(theme),
                }}
              />
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages?.map((page) => {
                const targetPath = page?.path
                  ? page.path.startsWith('/')
                    ? page.path
                    : `/${page.path}`
                  : '/'
                const isSelected = location.pathname === targetPath
                return (
                  <List key={page.id} onClick={handleCloseNavMenu}>
                    <ListItemButton
                      key={page.id}
                      selected={isSelected}
                      sx={{
                        '&.MuiListItemButton-root.Mui-selected': {
                          borderRight: `${navbarTokens.layout.selectedBorderWidth} solid ${theme.palette.background.paper}`,
                          zIndex: navbarTokens.layout.zIndexOffset,
                        },
                      }}
                      onClick={() => {
                        navigate(targetPath)
                      }}
                    >
                      <ListItemText
                        style={{
                          textDecoration: 'none',
                        }}
                        primary={translateLabel(page?.label)}
                      />
                    </ListItemButton>
                  </List>
                )
              })}
              {(user === undefined || user === null || isObjectEmpty(user)) && [
                <Divider key='auth-divider' sx={{ my: 1 }} />,
                <List key='auth-signin' onClick={handleCloseNavMenu}>
                  <ListItemButton
                    sx={{ minHeight: 44 }}
                    onClick={() => navigate(AppPaths.auth.signin)}
                  >
                    <ListItemText primary={t('navigation.login')} />
                  </ListItemButton>
                </List>,
                <List key='auth-signup' onClick={handleCloseNavMenu}>
                  <ListItemButton
                    sx={{ minHeight: 44 }}
                    onClick={() => navigate(AppPaths.auth.signup)}
                  >
                    <ListItemText primary={t('navigation.register')} />
                  </ListItemButton>
                </List>,
              ]}
            </Menu>
          </Box>

          <Box
            sx={{
              display: { lg: 'none', md: 'none', sm: 'none', xs: 'flex' },
              margin: '0px',
              padding: '0px',
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              marginRight: 0,
              marginLeft: 'auto',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <Stack direction='row'>
              <SearchBar />
              <ModeDropdown />
              {user === undefined || user === null || isObjectEmpty(user) ? (
                // Hidden on xs: logo + search + mode + two text buttons overflow
                // a phone-width toolbar and push "Register" outside the viewport.
                // The mobile menu below carries the same two actions instead.
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <AuthButtons />
                </Box>
              ) : (
                <AuthProfile />
              )}
            </Stack>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
