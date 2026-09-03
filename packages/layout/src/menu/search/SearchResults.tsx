import { useRef, useEffect } from 'react'
import { Box } from '@mui/material'
import { KBarResults, useKBar, useMatches } from 'kbar'
import type { ActionImpl } from 'kbar'
import DefaultSuggestions from './DefaultSuggestions'
import NoResult from './NoResult'
import SearchResultItem from './SearchResultItem'
import type { SearchItemConfig } from '@cap/shared-types'
import { searchTokens } from '@cap/theme'

type Results = Array<string | ActionImpl>

// Filter the search result data by limiting the number of results per section to 3 if
// there is more than one section. Otherwise, limit the number of results to 5.
const getFilteredResults = (results: Results) => {
  const sectionIndices: Array<number> = []

  results.forEach((item, index) => {
    if (typeof item === 'string') {
      sectionIndices.push(index)
    }
  })

  if (sectionIndices.length === 1) return results.slice(0, 6)

  const data: Results = []

  sectionIndices.forEach((sectionIndex, index) => {
    const nextSectionIndex = sectionIndices[index + 1] || results.length
    const sectionResults = results.slice(sectionIndex, Math.min(sectionIndex + 4, nextSectionIndex))

    data.push(...sectionResults)
  })

  return data
}

const SearchResults = ({ currentPath, data }: { currentPath: string; data: Array<SearchItemConfig> }) => {
  // Use ref to track query without causing re-renders
  const queryRef = useRef<string | undefined>('')

  // Hooks - get searchQuery directly from useKBar state
  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery,
  }))

  // Update ref when searchQuery changes
  useEffect(() => {
    queryRef.current = searchQuery
  }, [searchQuery])

  const { results, rootActionId } = useMatches()

  if (searchQuery === '') return <DefaultSuggestions />

  if (results.length === 0) return <NoResult query={searchQuery} />

  return (
    <KBarResults
      items={getFilteredResults(results)}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <Box
            sx={{
              paddingBlockStart: searchTokens.sectionHeader.paddingBlockStart,
              paddingBlockEnd: searchTokens.sectionHeader.paddingBlockEnd,
              paddingInline: searchTokens.sectionHeader.paddingInline,
              fontSize: searchTokens.sectionHeader.fontSize,
              lineHeight: searchTokens.sectionHeader.lineHeight,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: searchTokens.sectionHeader.letterSpacing,
            }}
          >
            {item}
          </Box>
        ) : (
          <SearchResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
            currentPath={currentPath}
            data={data.filter((d) => d.id === item.id)[0]}
          />
        )
      }
      // @ts-expect-error - maxHeight prop works but not in types
      maxHeight='100%'
    />
  )
}

export default SearchResults
