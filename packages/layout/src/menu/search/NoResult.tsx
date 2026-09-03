import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, Typography, List, ListItem } from '@mui/material'
import { useKBar } from 'kbar'
import { useTranslation } from 'react-i18next'
import { i18n as i18nConfig, getSearchItems } from '@cap/platform-core'
import { searchTokens } from '@cap/theme'

const getLocalizedUrl = (url: string, locale: string): string => {
  if (!locale) return url
  return locale === i18nConfig.defaultLocale ? url : `/${locale}${url}`
}

type NoResultProps = {
  query: string | undefined
}

const NoResult = (props: NoResultProps) => {
  const { query } = props
  const { t } = useTranslation()
  const { query: kbarQuery } = useKBar()
  const { lang: locale } = useParams<{ lang?: string }>()

  const suggestions = React.useMemo(() => {
    const items = getSearchItems().slice(0, 3)
    return items.map((item) => {
      const rawName = item.name || ''
      const cleanNameKey = rawName.replace(/^navigation\./, '')
      const translatedName = t(rawName, {
        defaultValue: t(`navigation.${cleanNameKey}`, { defaultValue: rawName }),
      })
      return {
        id: item.id,
        label: translatedName,
        href: item.url,
        icon: item.icon,
      }
    })
  }, [t])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        flexWrap: 'wrap',
        paddingBlock: searchTokens.defaultSuggestions.paddingBlock,
        paddingInline: searchTokens.defaultSuggestions.paddingInline,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          component='i'
          className={searchTokens.noResult.unknownIconClass}
          sx={{ fontSize: searchTokens.noResult.iconFontSize, marginBlockEnd: searchTokens.noResult.iconMarginBlockEnd, color: 'text.secondary' }}
        />
        <Typography
          sx={{
            fontSize: searchTokens.noResult.titleFontSize,
            fontWeight: searchTokens.noResult.titleFontWeight,
            lineHeight: searchTokens.noResult.titleLineHeight,
            marginBlockEnd: searchTokens.noResult.titleMarginBlockEnd,
          }}
        >
          {t('search.no_results', { query, defaultValue: `No result for "${query}"` })}
        </Typography>
        <Typography
          sx={{
            fontSize: searchTokens.noResult.subtitleFontSize,
            lineHeight: searchTokens.noResult.subtitleLineHeight,
            marginBlockEnd: searchTokens.noResult.subtitleMarginBlockEnd,
            color: 'text.disabled',
          }}
        >
          {t('search.try_searching_for', { defaultValue: 'Try searching for' })}
        </Typography>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: searchTokens.defaultSuggestions.sectionGap, p: 0 }}>
          {suggestions.map((item) => (
            <ListItem key={item.id} sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
              <Box
                component={Link}
                to={getLocalizedUrl(item.href, locale || '')}
                onClick={kbarQuery.toggle}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { color: 'primary.main' },
                  '&:focus-visible': { color: 'primary.main', outline: 0 },
                }}
              >
                {item.icon && (
                  <Box sx={{ display: 'flex', fontSize: searchTokens.defaultSuggestions.iconFontSize, alignItems: 'center' }}>
                    {React.isValidElement(item.icon)
                      ? item.icon
                      : typeof item.icon === 'string' ? (
                          <Box component='i' className={item.icon} sx={{ fontSize: searchTokens.defaultSuggestions.iconFontSize }} />
                        ) : null}
                  </Box>
                )}
                <Typography
                  sx={{
                    fontSize: searchTokens.defaultSuggestions.itemLabelFontSize,
                    lineHeight: searchTokens.defaultSuggestions.itemLabelLineHeight,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default NoResult
