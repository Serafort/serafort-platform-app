import { Box, Container, Typography, IconButton, Link as HLInk, themeConfig } from '@cap/theme'
import { AppPaths } from '@cap/shared-types'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import FacebookIcon from '@mui/icons-material/Facebook'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <Box
      component='footer'
      sx={{
        width: '100%',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: { xs: 5, sm: 10 },
      }}
    >
      <Container
        maxWidth='lg'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textAlign: 'center',
        }}
      >
        {/* Navigation Links */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, sm: 4 },
          }}
        >
          <HLInk
            component={Link}
            to={AppPaths.landing.privacyPolicy}
            underline='none'
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            {t('landing.privacyPolicy', 'Privacy Policy')}
          </HLInk>
          <HLInk
            component={Link}
            to={AppPaths.landing.termsOfService}
            underline='none'
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            {t('landing.termsOfService', 'Terms of Service')}
          </HLInk>
          <HLInk
            component={Link}
            to={AppPaths.landing.contact}
            underline='none'
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            {t('landing.contact', 'Contact Us')}
          </HLInk>
        </Box>

        {/* Social Media Icons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <IconButton
            href='#'
            aria-label='Twitter'
            sx={{
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href='#'
            aria-label='LinkedIn'
            sx={{
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <LinkedInIcon />
          </IconButton>
          <IconButton
            href='#'
            aria-label='Facebook'
            sx={{
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <FacebookIcon />
          </IconButton>
        </Box>

        {/* Branding & Description */}
        <Typography variant='body2' sx={{ color: 'text.secondary', maxWidth: 480 }}>
          {t(
            'footer.description',
            `${themeConfig.templateName} - Build and scale your applications with speed and confidence.`,
          )}
        </Typography>

        {/* Copyright */}
        <Typography
          variant='body2'
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
          }}
        >
          {t(
            'footer.copyright',
            `© ${new Date().getFullYear()} ${themeConfig.templateName}. All rights reserved.`,
          )}
        </Typography>
      </Container>
    </Box>
  )
}
