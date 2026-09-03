import React, { Fragment, forwardRef, useMemo } from 'react'
import type { Ref } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { ActionId, ActionImpl } from 'kbar'
import { i18n as i18nConfig } from '@cap/platform-core'
import type { SearchItemConfig } from '@cap/shared-types'
import { searchTokens } from '@cap/theme'

type Locale = (typeof i18nConfig)['locales'][number]

const getLocalizedUrl = (url: string, locale: string): string => {
  if (!locale) return url
  return locale === i18nConfig.defaultLocale ? url : `/${locale}${url}`
}

const Title = ({ title, flexGrow = false }: { title: string; flexGrow?: boolean }) => {
  return (
    <Typography
      component='span'
      sx={{
        flexGrow: flexGrow ? 1 : 0,
        fontSize: searchTokens.resultItem.titleFontSize,
        lineHeight: searchTokens.resultItem.titleLineHeight,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </Typography>
  )
}

const TitleWithAncestors = ({
  title,
  flexGrow = false,
  ancestors,
}: {
  title: string
  flexGrow?: boolean
  ancestors: ActionImpl[]
}) => {
  if (ancestors.length === 0) return <Title title={title} flexGrow={flexGrow} />

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
      {ancestors.map((ancestor: ActionImpl) => (
        <Fragment key={ancestor.id}>
          <Box component='span' sx={{ opacity: 0.5 }}>
            {ancestor.name}
          </Box>
          <span>&rsaquo;</span>
        </Fragment>
      ))}
      <Title title={title} flexGrow={flexGrow} />
    </Box>
  )
}

const Shortcut = ({ shortcut }: { shortcut: string[] }) => {
  const kbdSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: searchTokens.resultItem.kbdMinWidth,
    height: searchTokens.resultItem.kbdHeight,
    px: searchTokens.resultItem.kbdPx,
    borderRadius: searchTokens.resultItem.kbdBorderRadius,
    fontSize: searchTokens.resultItem.kbdFontSize,
    fontWeight: searchTokens.resultItem.kbdFontWeight,
    bgcolor: 'action.hover',
    border: 1,
    borderColor: 'divider',
    color: 'text.secondary',
  }

  if (shortcut.length > 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {shortcut.map((sc) => (
          <Box component='kbd' key={sc} sx={kbdSx}>
            {sc}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Box component='kbd' sx={kbdSx}>
      {shortcut[0]}
    </Box>
  )
}

const EnterComponent = ({
  active,
  currentPath,
  data,
  locale,
}: {
  active: boolean
  currentPath: string
  data: SearchItemConfig
  locale: Locale
}) => {
  const theme = useTheme()
  const isCurrentPath = currentPath === getLocalizedUrl(data.url, locale as Locale)

  return (
    active && (
      <Box
        component='i'
        className={
          theme.direction === 'ltr' ? searchTokens.resultItem.enterLtrClass : searchTokens.resultItem.enterRtlClass
        }
        sx={{
          fontSize: searchTokens.resultItem.enterIconFontSize,
          ...(isCurrentPath && { color: 'primary.main' }),
        }}
      />
    )
  )
}

const SearchResultItem = forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
      currentPath,
      data,
    }: {
      action: ActionImpl
      active: boolean
      currentRootActionId: ActionId | undefined | null
      currentPath: string
      data: SearchItemConfig
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    // Hooks
    const { lang: locale } = useParams<{ lang?: string }>()

    const ancestors = useMemo(() => {
      if (!currentRootActionId) return action.ancestors

      const index = action.ancestors.findIndex((ancestor) => ancestor.id === currentRootActionId)

      return action.ancestors.slice(index + 1)
    }, [action.ancestors, currentRootActionId])

    const isCurrentPath = currentPath === getLocalizedUrl(data.url, locale || '')

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: searchTokens.resultItem.gap,
          position: 'relative',
          paddingBlock: searchTokens.resultItem.paddingBlock,
          paddingInline: searchTokens.resultItem.paddingInline,
          cursor: 'pointer',
          borderRadius: searchTokens.resultItem.borderRadius,
          ...(active && !isCurrentPath && { bgcolor: 'action.selected' }),
          ...(!active &&
            isCurrentPath && {
              bgcolor: 'primary.lightOpacity',
              color: 'primary.main',
            }),
          ...(active &&
            isCurrentPath && {
              bgcolor: 'primary.mainOpacity',
              color: 'primary.main',
            }),
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2, fontSize: '0.875rem' }}
        >
          {action.icon && (
            React.isValidElement(action.icon) ? (
              action.icon
            ) : typeof action.icon === 'string' ? (
              <Box component='i' className={action.icon.startsWith('tabler-') ? action.icon : `tabler-${action.icon}`} sx={{ fontSize: searchTokens.defaultSuggestions.iconFontSize }} />
            ) : null
          )}
          {action.name &&
            (action.subtitle ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <TitleWithAncestors title={action.name} ancestors={ancestors} />
                {action.subtitle && (
                  <Typography
                    component='span'
                    sx={{
                      fontSize: searchTokens.resultItem.subtitleFontSize,
                      lineHeight: searchTokens.resultItem.subtitleLineHeight,
                      color: 'text.secondary',
                    }}
                  >
                    {action.subtitle}
                  </Typography>
                )}
              </Box>
            ) : (
              <TitleWithAncestors flexGrow title={action.name} ancestors={ancestors} />
            ))}
        </Box>
        <EnterComponent
          active={active}
          currentPath={currentPath}
          data={data}
          locale={(locale || '') as Locale}
        />
        {action.shortcut?.length && <Shortcut shortcut={action.shortcut} />}
      </Box>
    )
  },
)

SearchResultItem.displayName = 'SearchResultItem'

export default SearchResultItem
