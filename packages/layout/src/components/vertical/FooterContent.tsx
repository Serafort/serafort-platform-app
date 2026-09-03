import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@cap/platform-store'
import { AppPaths } from '@cap/shared-types'
import { useVerticalNav } from '../../hooks/useVerticalNav'
import { useHorizontalNav } from '../../hooks/useHorizontalNav'
import { verticalLayoutClasses } from '../../utils/layoutClasses'

const FooterContent = () => {
  const { settings } = useSettings()
  const { isBreakpointReached: isVerticalBreakpointReached } = useVerticalNav()
  const { isBreakpointReached: isHorizontalBreakpointReached } = useHorizontalNav()
  const { t } = useTranslation()

  const isBreakpointReached =
    settings.layout === 'vertical' ? isVerticalBreakpointReached : isHorizontalBreakpointReached

  return (
    <Box
      className={verticalLayoutClasses.footerContent}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        {`© ${new Date().getFullYear()}, ${t('footer.madeWith')} ❤️ ${t('footer.by')} `}
        <Link
          href={AppPaths.landing.home}
          underline='hover'
          color='primary.main'
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        >
          CAP Framework
        </Link>
      </Typography>

      {!isBreakpointReached && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link
            href={AppPaths.landing.termsOfService}
            underline='hover'
            color='text.secondary'
            variant='body2'
          >
            {t('footer.license')}
          </Link>
          <Link
            href={AppPaths.landing.about}
            underline='hover'
            color='text.secondary'
            variant='body2'
          >
            {t('footer.documentation')}
          </Link>
          <Link
            href={AppPaths.landing.contact}
            underline='hover'
            color='text.secondary'
            variant='body2'
          >
            {t('footer.support')}
          </Link>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
