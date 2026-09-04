import { useTranslation } from 'react-i18next'
import type { ElementType, ReactNode } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Box, IconButton, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Search from '@mui/icons-material/Search'
import Close from '@mui/icons-material/Close'
import { useMedia } from 'react-use'
import { KBarProvider, KBarPortal, KBarPositioner, KBarSearch, useKBar, type KBarState } from 'kbar'
import SearchResults from './SearchResults'
import StyledKBarAnimator from './StyledKBarAnimator'
import type { ChildrenType } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { i18n as i18nConfig, getSearchItems } from '@cap/platform-core'
import { useVerticalNav } from '../../hooks/useVerticalNav'
import {
  zIndexScale,
  searchTokens,
  getSearchBackdropBgColor,
  getTenantThemeEffects,
} from '@cap/theme'

export type Locale = (typeof i18nConfig)['locales'][number]

const getLocalizedUrl = (url: string, locale: string): string => {
  if (!locale) return url
  return locale === i18nConfig.defaultLocale ? url : `/${locale}${url}`
}

type ComponentWithUseKBarProps = Partial<ChildrenType> & {
  sx?: object
  icon?: ReactNode
  tag?: ElementType
  triggerClick?: boolean
}

const ComponentWithUseKBar = (props: ComponentWithUseKBarProps) => {
  const { children, sx, icon, tag, triggerClick = false } = props

  const { isBreakpointReached, isToggled, toggleVerticalNav } = useVerticalNav()

  const { query } = useKBar((state: KBarState) => {
    if (isBreakpointReached && isToggled && state.visualState === 'showing') {
      toggleVerticalNav(false)
    }
  })

  const Tag = tag || Box

  return (
    <Tag sx={sx} {...(triggerClick && { onClick: query.toggle })}>
      {icon || children}
    </Tag>
  )
}

const NavSearch = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const pathName = location.pathname
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()
  const isSmallScreen = useMedia('(max-width: 600px)', false)
  const isGlassEffect = getTenantThemeEffects(theme).globalType === 'glass'
  const { lang: locale } = useParams<{ lang?: string }>()

  const dynamicSearchData = getSearchItems()

  const searchActions = dynamicSearchData.map((item) => {
    const rawName = item.name || ''
    const cleanNameKey = rawName.replace(/^navigation\./, '')
    const translatedName = t(rawName, {
      defaultValue: t(`navigation.${cleanNameKey}`, { defaultValue: rawName }),
    })

    const rawSection = item.section || ''
    const cleanSectionKey = rawSection.replace(/^navigation\./, '')
    const translatedSection = rawSection
      ? t(rawSection, {
          defaultValue: t(`navigation.${cleanSectionKey}`, { defaultValue: rawSection }),
        })
      : undefined

    return {
      ...item,
      name: translatedName,
      section: translatedSection,
      url: undefined,
      perform: () =>
        item.url.startsWith('http')
          ? window.open(item.url, '_blank')
          : navigate(getLocalizedUrl(item.url, locale || '')),
    }
  })

  return (
    <KBarProvider actions={searchActions}>
      <ComponentWithUseKBar
        triggerClick
        sx={{ display: 'flex', flex: 1, minWidth: 0, cursor: 'pointer' }}
        {...(isBreakpointReached && {
          icon: (
            <IconButton aria-label='Open search' sx={{ color: 'text.primary' }}>
              <Search />
            </IconButton>
          ),
        })}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: searchTokens.header.gap,
            inlineSize: '100%',
            paddingInline: '0.5rem 1rem',
            // A box-shadow blurs around every edge of the shape, including
            // left/right, no matter what the y-offset is - a border only
            // ever renders on the edge it's named for, so it's the only way
            // to get a shadow-like cue confined to just the bottom.
            borderBottom: (theme) =>
              theme.palette.mode === 'dark'
                ? '2px solid rgba(0, 0, 0, 0.5)'
                : '2px solid rgba(15, 23, 42, 0.12)',
            transition: 'border-color 150ms ease',
            '&:hover': {
              borderBottomColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(15, 23, 42, 0.22)',
            },
          }}
        >
          <IconButton aria-label='Open search' sx={{ color: 'text.primary' }}>
            <Search />
          </IconButton>
          <Typography sx={{ whiteSpace: 'nowrap', color: 'text.disabled' }}>
            {t('search.placeholder', { defaultValue: 'Search ⌘K' })}
          </Typography>
        </Box>
      </ComponentWithUseKBar>
      <KBarPortal>
        <KBarPositioner
          style={{
            padding: 0,
            alignItems: 'center',
            zIndex: zIndexScale.search + 1,
          }}
        >
          <StyledKBarAnimator skin={settings.skin} isSmallScreen={isSmallScreen}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: searchTokens.header.gap,
                paddingBlock: searchTokens.header.paddingBlock,
                paddingInline: searchTokens.header.paddingInline,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Search />
              </Box>
              <KBarSearch
                defaultPlaceholder={t('search.input_placeholder', { defaultValue: 'Search...' })}
                name='search-input'
                style={{
                  flexGrow: 1,
                  minInlineSize: 0,
                  paddingBlock: searchTokens.header.inputPaddingBlock,
                  paddingInline: searchTokens.header.inputPaddingInline,
                  fontSize: searchTokens.header.inputFontSize,
                  outline: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              />
              <ComponentWithUseKBar sx={{ userSelect: 'none', color: 'text.disabled' }}>
                {`[esc]`}
              </ComponentWithUseKBar>
              <ComponentWithUseKBar
                triggerClick
                sx={{ display: 'flex', cursor: 'pointer' }}
                icon={
                  <Close
                    aria-label='Close search'
                    sx={{ fontSize: searchTokens.header.closeIconFontSize, color: 'text.primary' }}
                  />
                }
              />
            </Box>
            <SearchResults currentPath={pathName} data={dynamicSearchData} />
          </StyledKBarAnimator>
        </KBarPositioner>
        <Box
          role='button'
          aria-label='backdrop'
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: zIndexScale.search,
            bgcolor: getSearchBackdropBgColor(theme),
            backdropFilter: isGlassEffect ? searchTokens.backdrop.blur : 'none',
          }}
        />
      </KBarPortal>
    </KBarProvider>
  )
}

export default NavSearch
