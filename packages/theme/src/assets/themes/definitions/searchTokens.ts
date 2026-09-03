import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

/**
 * Command Palette & Global Search Tokens & Helper Functions
 * Centralizes animator modal dimensions, input padding/font sizes, backdrop filters,
 * shortcut badge dimensions, result item typography, and section header styling.
 */

export interface SearchTokens {
  animator: {
    desktopInlineSize: string
    desktopMaxInlineSize: string
    desktopBlockSize: string
    desktopMaxBlockSize: string
    mobileMinBlockSize: string
    mobileMaxBlockSize: string
    mobileMinInlineSize: string
    mobileMaxInlineSize: string
    listboxPaddingInline: string
    listboxItemInset: string
    listboxItemWidth: string
  }
  header: {
    gap: number
    paddingBlock: number
    paddingInline: number
    closeIconFontSize: string
    inputPaddingBlock: string
    inputPaddingInline: string
    inputFontSize: string
  }
  backdrop: {
    bgAlpha: number
    blur: string
  }
  defaultSuggestions: {
    columnGap: string
    rowGap: number
    paddingBlock: number
    paddingInline: number
    sectionGap: number
    smFlexBasis: string
    sectionLabelFontSize: string
    sectionLabelLineHeight: number
    sectionLabelLetterSpacing: string
    itemLabelFontSize: string
    itemLabelLineHeight: number
    iconFontSize: string
  }
  noResult: {
    iconFontSize: string
    iconMarginBlockEnd: number
    unknownIconClass: string
    titleFontSize: string
    titleFontWeight: number
    titleLineHeight: number
    titleMarginBlockEnd: number
    subtitleFontSize: string
    subtitleLineHeight: number
    subtitleMarginBlockEnd: number
  }
  resultItem: {
    gap: number
    paddingBlock: number
    paddingInline: number
    borderRadius: number
    titleFontSize: string
    titleLineHeight: number
    subtitleFontSize: string
    subtitleLineHeight: number
    kbdMinWidth: number
    kbdHeight: number
    kbdPx: number
    kbdBorderRadius: number
    kbdFontSize: string
    kbdFontWeight: number
    enterIconFontSize: string
    enterLtrClass: string
    enterRtlClass: string
  }
  sectionHeader: {
    paddingBlockStart: number
    paddingBlockEnd: number
    paddingInline: number
    fontSize: string
    lineHeight: number
    letterSpacing: string
  }
}

export const searchTokens: SearchTokens = {
  animator: {
    desktopInlineSize: '600px',
    desktopMaxInlineSize: '90dvw',
    desktopBlockSize: '580px',
    desktopMaxBlockSize: '90dvh',
    mobileMinBlockSize: '100dvh',
    mobileMaxBlockSize: '100dvh',
    mobileMinInlineSize: '100dvw',
    mobileMaxInlineSize: '100dvw',
    listboxPaddingInline: '0.5rem',
    listboxItemInset: '8px !important',
    listboxItemWidth: 'calc(100% - 16px) !important',
  },
  header: {
    gap: 2,
    paddingBlock: 5,
    paddingInline: 6,
    closeIconFontSize: '22px',
    inputPaddingBlock: '4px',
    inputPaddingInline: '6px',
    inputFontSize: '16px',
  },
  backdrop: {
    bgAlpha: 0.5,
    blur: 'blur(4px)',
  },
  defaultSuggestions: {
    columnGap: '48px',
    rowGap: 8,
    paddingBlock: 14,
    paddingInline: 16,
    sectionGap: 4,
    smFlexBasis: 'calc((100% - 3rem) / 2)',
    sectionLabelFontSize: '0.75rem',
    sectionLabelLineHeight: 1.16667,
    sectionLabelLetterSpacing: '0.8px',
    itemLabelFontSize: '15px',
    itemLabelLineHeight: 1.4667,
    iconFontSize: '1.25rem',
  },
  noResult: {
    iconFontSize: '64px',
    iconMarginBlockEnd: 2.5,
    unknownIconClass: 'tabler-file-unknown',
    titleFontSize: '1.125rem',
    titleFontWeight: 500,
    titleLineHeight: 1.55556,
    titleMarginBlockEnd: 11,
    subtitleFontSize: '15px',
    subtitleLineHeight: 1.4667,
    subtitleMarginBlockEnd: 4,
  },
  resultItem: {
    gap: 4,
    paddingBlock: 2,
    paddingInline: 4,
    borderRadius: 1,
    titleFontSize: '15px',
    titleLineHeight: 1.4667,
    subtitleFontSize: '13px',
    subtitleLineHeight: 1.538462,
    kbdMinWidth: 24,
    kbdHeight: 24,
    kbdPx: 1,
    kbdBorderRadius: 0.5,
    kbdFontSize: '0.75rem',
    kbdFontWeight: 600,
    enterIconFontSize: '1.25rem',
    enterLtrClass: 'tabler-corner-down-left',
    enterRtlClass: 'tabler-corner-down-right',
  },
  sectionHeader: {
    paddingBlockStart: 4,
    paddingBlockEnd: 2,
    paddingInline: 4,
    fontSize: '12px',
    lineHeight: 1.16667,
    letterSpacing: '0.8px',
  },
}

/**
 * Returns mode-aware backdrop color for search portal overlay
 */
export const getSearchBackdropBgColor = (theme: Theme): string => {
  return alpha(theme.palette.common.black, searchTokens.backdrop.bgAlpha)
}
