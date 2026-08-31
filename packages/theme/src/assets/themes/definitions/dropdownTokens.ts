import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

/**
 * Shared Menu & Navbar Dropdown Design Tokens & Helper Functions
 * Centralizes Popper minInlineSizes, paper radii, avatar badge dimensions,
 * notification/shortcut scroll wrapper heights, logo typography, and user menu item hover mixins.
 */

export interface DropdownTokens {
  dropdownPopper: {
    minInlineSizeSmall: string;
    minInlineSizeUser: string;
    marginBlockStart: string;
    paperBorderRadius: string;
    itemGap: string;
    itemIconFontSize: string;
  };
  logo: {
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
    letterSpacing: string;
    marginInlineStart: string;
    iconFontSize: string;
    iconLineHeight: string;
  };
  notifications: {
    popperInlineSizeDesktop: number;
    popperMarginBlockStart: number;
    maxBlockSize: number;
    badgeTop: number;
    badgeRight: number;
    headerPaddingBlock: number;
    headerPaddingInline: number;
    itemPaddingBlock: number;
    itemPaddingInline: number;
    itemGap: number;
    footerPadding: number;
  };
  shortcuts: {
    maxBlockSize: number;
    avatarWidth: number;
    avatarHeight: number;
    itemPadding: number;
    itemGap: number;
    gridColumns: string;
  };
  userDropdown: {
    badgeDotSize: number;
    badgeDotBorderRadius: string;
    badgeMarginInlineStart: string;
    avatarSize: string;
    headerPaddingBlock: string;
    headerPaddingInline: string;
    headerGap: string;
    itemMarginInline: string;
    itemMarginBlock: string;
    itemBorderRadius: string;
    itemGap: string;
    itemHoverTranslateX: string;
    itemHoverAlpha: number;
    logoutBoxPaddingBlock: string;
    logoutBoxPaddingInline: string;
    logoutEndIconMargin: number;
  };
}

export const dropdownTokens: DropdownTokens = {
  dropdownPopper: {
    minInlineSizeSmall: "160px",
    minInlineSizeUser: "240px",
    marginBlockStart: "0.75rem !important",
    paperBorderRadius: "12px !important",
    itemGap: "0.75rem",
    itemIconFontSize: "22px",
  },
  logo: {
    fontSize: "1.375rem",
    lineHeight: 1.09091,
    fontWeight: 700,
    letterSpacing: "0.25px",
    marginInlineStart: "12px",
    iconFontSize: "1.5rem",
    iconLineHeight: "2rem",
  },
  notifications: {
    popperInlineSizeDesktop: 384,
    popperMarginBlockStart: 3,
    maxBlockSize: 420,
    badgeTop: 6,
    badgeRight: 5,
    headerPaddingBlock: 3,
    headerPaddingInline: 4,
    itemPaddingBlock: 3,
    itemPaddingInline: 4,
    itemGap: 3,
    footerPadding: 4,
  },
  shortcuts: {
    maxBlockSize: 434,
    avatarWidth: 50,
    avatarHeight: 50,
    itemPadding: 6,
    itemGap: 3,
    gridColumns: "repeat(2, 1fr)",
  },
  userDropdown: {
    badgeDotSize: 8,
    badgeDotBorderRadius: "50%",
    badgeMarginInlineStart: "0.5rem",
    avatarSize: "38px",
    headerPaddingBlock: "0.5rem",
    headerPaddingInline: "1.5rem",
    headerGap: "0.5rem",
    itemMarginInline: "8px !important",
    itemMarginBlock: "4px !important",
    itemBorderRadius: "8px !important",
    itemGap: "0.75rem",
    itemHoverTranslateX: "translateX(4px)",
    itemHoverAlpha: 0.05,
    logoutBoxPaddingBlock: "0.5rem",
    logoutBoxPaddingInline: "0.75rem",
    logoutEndIconMargin: 1.5,
  },
};

/**
 * Returns mode-aware item hover background string for user dropdown items
 */
export const getUserDropdownItemHoverBg = (theme: Theme): string => {
  return `${alpha(theme.palette.text.primary, dropdownTokens.userDropdown.itemHoverAlpha)} !important`;
};

/**
 * Returns user avatar badge dot box-shadow string
 */
export const getUserBadgeShadow = (theme: Theme): string => {
  return `0 0 0 2px ${theme.palette.background.paper}`;
};

/**
 * Returns notification badge dot box-shadow string
 */
export const getNotificationBadgeShadow = (theme: Theme): string => {
  return `${theme.palette.background.paper} 0px 0px 0px 2px`;
};
