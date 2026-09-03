import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Logo } from '../../shared'
import {
  themeConfig,
  guestNavbarTokens,
  getGuestNavbarBrandTitleColor,
  getGuestNavbarNavLinkColor,
  getGuestNavbarNavLinkHoverColor,
  getGuestNavbarOutlinedButtonHoverColor,
  getGuestNavbarContainedButtonBg,
  getGuestNavbarContainedButtonHoverBg,
  getGuestNavbarContainedButtonHoverColor,
  getGuestNavbarMobileIconButtonBg,
  getGuestNavbarMobileIconButtonColor,
  getGuestNavbarMobileIconButtonHoverBg,
  getGuestNavbarMobileListItemHoverBg,
} from '@cap/theme'
import { useNavigationMenu } from '@cap/platform-core'
import { Path } from '@cap/module-auth/routes/path'
import { useTranslation } from 'react-i18next'

const GuestNavbar = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Fetch dynamic public navigation links
  const navLinks = useNavigationMenu('public')

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

  const handleNavigate = (path: string | undefined) => {
    if (path !== undefined) {
      navigate(path)
    }
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <AppBar
        position={guestNavbarTokens.layout.appBarPosition}
        elevation={guestNavbarTokens.layout.appBarElevation}
        sx={{
          backgroundColor: 'transparent',
          py: guestNavbarTokens.layout.py,
        }}
      >
        <Container maxWidth={guestNavbarTokens.layout.containerMaxWidth}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo and Brand Name */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: guestNavbarTokens.layout.brandGap,
                textDecoration: 'none',
              }}
            >
              <Logo />
              <Typography
                variant={guestNavbarTokens.layout.brandVariant}
                sx={{
                  fontWeight: guestNavbarTokens.layout.brandTitleFontWeight,
                  color: getGuestNavbarBrandTitleColor(theme),
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {themeConfig.templateName}
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: guestNavbarTokens.layout.desktopNavGap,
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.id}
                  onClick={() => handleNavigate(link.path)}
                  sx={{
                    color: getGuestNavbarNavLinkColor(theme),
                    fontSize: guestNavbarTokens.layout.navLinkFontSize,
                    fontWeight: guestNavbarTokens.layout.navLinkFontWeight,
                    textTransform: 'none',
                    transition: guestNavbarTokens.transitions.color,
                    '&:hover': {
                      color: getGuestNavbarNavLinkHoverColor(theme),
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {translateLabel(link.label)}
                </Button>
              ))}
            </Box>

            {/* Action Buttons */}
            <Stack
              direction='row'
              spacing={guestNavbarTokens.layout.actionStackSpacing}
              alignItems='center'
            >
              <Button
                variant='outlined'
                onClick={() => handleNavigate(Path.auth.signup)}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  minWidth: guestNavbarTokens.layout.actionButtonMinWidth,
                  height: guestNavbarTokens.layout.actionButtonHeight,
                  px: guestNavbarTokens.layout.actionButtonPx,
                  fontWeight: guestNavbarTokens.layout.actionButtonFontWeight,
                  fontSize: guestNavbarTokens.layout.actionButtonFontSize,
                  textTransform: 'none',
                  letterSpacing: guestNavbarTokens.layout.actionButtonLetterSpacing,
                  transition: guestNavbarTokens.transitions.backgroundColor,
                  '&:hover': {
                    color: getGuestNavbarOutlinedButtonHoverColor(theme),
                  },
                }}
              >
                {t('navigation.register')}
              </Button>
              <Button
                variant='contained'
                onClick={() => handleNavigate(Path.auth.signin)}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  minWidth: guestNavbarTokens.layout.actionButtonMinWidth,
                  height: guestNavbarTokens.layout.actionButtonHeight,
                  px: guestNavbarTokens.layout.actionButtonPx,
                  backgroundColor: getGuestNavbarContainedButtonBg(theme),
                  color: theme.palette.primary.main,
                  fontWeight: guestNavbarTokens.layout.actionButtonFontWeight,
                  fontSize: guestNavbarTokens.layout.actionButtonFontSize,
                  textTransform: 'none',
                  letterSpacing: guestNavbarTokens.layout.actionButtonLetterSpacing,
                  transition: guestNavbarTokens.transitions.backgroundColor,
                  '&:hover': {
                    backgroundColor: getGuestNavbarContainedButtonHoverBg(theme),
                    color: getGuestNavbarContainedButtonHoverColor(theme),
                  },
                }}
              >
                {t('navigation.login')}
              </Button>

              {/* Mobile Menu Button */}
              <IconButton
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
                aria-expanded={mobileMenuOpen}
                aria-controls='guest-mobile-nav'
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  width: guestNavbarTokens.layout.mobileMenuButtonSize,
                  height: guestNavbarTokens.layout.mobileMenuButtonSize,
                  backgroundColor: getGuestNavbarMobileIconButtonBg(theme),
                  color: getGuestNavbarMobileIconButtonColor(theme),
                  '&:hover': {
                    backgroundColor: getGuestNavbarMobileIconButtonHoverBg(theme),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor={guestNavbarTokens.layout.mobileDrawerAnchor}
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: guestNavbarTokens.layout.mobileDrawerWidth,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            pt: guestNavbarTokens.layout.mobileDrawerPt,
            pb: guestNavbarTokens.layout.mobileDrawerPb,
          }}
        >
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(link.path)}
                  sx={{
                    py: guestNavbarTokens.layout.mobileListItemPy,
                    px: guestNavbarTokens.layout.mobileListItemPx,
                    '&:hover': {
                      backgroundColor: getGuestNavbarMobileListItemHoverBg(theme),
                    },
                  }}
                >
                  <ListItemText
                    primary={translateLabel(link.label)}
                    primaryTypographyProps={{
                      fontSize: guestNavbarTokens.layout.mobileListItemFontSize,
                      fontWeight: guestNavbarTokens.layout.mobileListItemFontWeight,
                      color: theme.palette.text.primary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem
              disablePadding
              sx={{
                mt: guestNavbarTokens.layout.mobileListItemMt,
                px: guestNavbarTokens.layout.mobileListItemButtonPx,
              }}
            >
              <Button
                fullWidth
                variant='contained'
                onClick={() => handleNavigate(Path.auth.signin)}
                sx={{
                  backgroundColor: getGuestNavbarContainedButtonBg(theme),
                  color: theme.palette.primary.main,
                  fontWeight: guestNavbarTokens.layout.actionButtonFontWeight,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: getGuestNavbarContainedButtonHoverBg(theme),
                    color: getGuestNavbarContainedButtonHoverColor(theme),
                  },
                }}
              >
                {t('navigation.login')}
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}

export default GuestNavbar
