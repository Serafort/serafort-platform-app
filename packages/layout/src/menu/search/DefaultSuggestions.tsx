import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, Typography, List, ListItem } from '@mui/material'
import { useKBar } from 'kbar'
import { useTranslation } from 'react-i18next'
import { i18n as i18nConfig, getSearchItems } from '@cap/platform-core'
import { useTheme } from '@mui/material/styles'

const getLocalizedUrl = (url: string, locale: string): string => {
  if (!locale) return url
  return locale === i18nConfig.defaultLocale ? url : `/${locale}${url}`
}

const DefaultSuggestions = () => {
  const { t } = useTranslation()
  const { query } = useKBar()
  const { lang: locale } = useParams<{ lang?: string }>()
  const theme = useTheme()
  const searchTokens = theme.cap.searchTokens

  const searchItems = getSearchItems()

  // Dynamic grouping by section with i18n translation
  const groupedSections = React.useMemo(() => {
    const map = new Map<string, typeof searchItems>()

    searchItems.forEach((item) => {
      const rawSection = item.section || 'navigation.appsPages'
      if (!map.has(rawSection)) {
        map.set(rawSection, [])
      }
      map.get(rawSection)!.push(item)
    })

    return Array.from(map.entries()).map(([sectionKey, items]) => {
      const cleanSectionKey = sectionKey.replace(/^navigation\./, '')
      const translatedSection = t(sectionKey, {
        defaultValue: t(`navigation.${cleanSectionKey}`, { defaultValue: sectionKey }),
      })

      return {
        sectionLabel: translatedSection,
        items: items.map((item) => {
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
        }),
      }
    })
  }, [searchItems, t])

  if (groupedSections.length === 0) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        flexWrap: 'wrap',
        columnGap: searchTokens.defaultSuggestions.columnGap,
        rowGap: searchTokens.defaultSuggestions.rowGap,
        paddingBlock: searchTokens.defaultSuggestions.paddingBlock,
        paddingInline: searchTokens.defaultSuggestions.paddingInline,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {groupedSections.map((section, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowX: 'hidden',
            gap: searchTokens.defaultSuggestions.sectionGap,
            flexBasis: { xs: '100%', sm: searchTokens.defaultSuggestions.smFlexBasis },
          }}
        >
          <Typography
            sx={{
              fontSize: searchTokens.defaultSuggestions.sectionLabelFontSize,
              lineHeight: searchTokens.defaultSuggestions.sectionLabelLineHeight,
              textTransform: 'uppercase',
              color: 'text.disabled',
              letterSpacing: searchTokens.defaultSuggestions.sectionLabelLetterSpacing,
            }}
          >
            {section.sectionLabel}
          </Typography>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: searchTokens.defaultSuggestions.sectionGap, p: 0 }}>
            {section.items.map((item) => (
              <ListItem key={item.id} sx={{ display: 'flex', p: 0 }}>
                <Box
                  component={Link}
                  to={getLocalizedUrl(item.href, locale || '')}
                  onClick={query.toggle}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    overflowX: 'hidden',
                    cursor: 'pointer',
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
      ))}
    </Box>
  )
}

export default DefaultSuggestions
