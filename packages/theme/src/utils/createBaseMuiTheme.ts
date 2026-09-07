import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { Direction, Settings, Skin, SystemMode } from "@cap/shared-types";
import { elevationScale } from "./elevation";
import coreOverrides from "../overrides/core-overrides";
import { zIndexScale } from "../assets/themes/definitions/zIndex";
import { headerTokens } from "../assets/themes/definitions/headerTokens";
import { menuTokens } from "../assets/themes/definitions/menuTokens";
import { footerTokens } from "../assets/themes/definitions/footerTokens";
import { mainTokens } from "../assets/themes/definitions/mainTokens";
import { stepperTokens } from "../assets/themes/definitions/stepperTokens";
import { guestNavbarTokens } from "../assets/themes/definitions/guestNavbarTokens";
import { navbarTokens } from "../assets/themes/definitions/navbarTokens";
import { adminMenuTokens } from "../assets/themes/definitions/adminMenuTokens";
import { layoutMenuTokens } from "../assets/themes/definitions/layoutMenuTokens";
import { searchTokens } from "../assets/themes/definitions/searchTokens";
import { dropdownTokens } from "../assets/themes/definitions/dropdownTokens";

const spacing = {
  spacing: (factor: number) => `${0.25 * factor}rem`,
};

/**
 * The palette colours the coloured elevation rings are projected from. Every
 * key is optional: whatever a caller omits falls back to the legacy literal
 * that slot has always used, so calling `createBaseMuiTheme` without a palette
 * keeps its historical output.
 */
export interface BrandShadowColors {
  primary?: string;
  secondary?: string;
  error?: string;
  warning?: string;
  info?: string;
  success?: string;
}

type BrandShadowKey = keyof BrandShadowColors;

/**
 * Legacy `rgb()` triads for the six coloured rings. These are the exact hues
 * the rings were hardcoded to before they were made tenant-aware; they now
 * serve only as the fallback when a caller passes no colour for a slot or the
 * colour it passes cannot be parsed.
 */
const LEGACY_RING_RGB: Record<BrandShadowKey, string> = {
  primary: "115, 103, 240",
  secondary: "128, 131, 144",
  error: "255, 76, 81",
  warning: "255, 159, 67",
  info: "0, 186, 209",
  success: "40, 199, 111",
};

/** `md`/`lg` grow the alpha and the blur/offset in lockstep with `sm`. */
const RING_GEOMETRY = {
  sm: { alpha: 0.3, offset: "0px 2px 6px" },
  md: { alpha: 0.4, offset: "0px 4px 16px" },
  lg: { alpha: 0.5, offset: "0px 6px 20px" },
} as const;

/**
 * Build the `{ sm, md, lg }` coloured-ring triple for one palette colour.
 *
 * When a tenant configures their own brand colour the ring is projected from
 * it (`alpha()` accepts hex, `rgb()` and `hsl()`); when no colour is supplied,
 * or `alpha()` throws on an unparseable value, the slot's legacy hue is used
 * so the output never regresses to a missing shadow.
 */
const buildColoredRing = (
  key: BrandShadowKey,
  color: string | undefined,
): { sm: string; md: string; lg: string } => {
  const fallbackRgb = LEGACY_RING_RGB[key];
  const ringColor = (channelAlpha: number): string => {
    if (color) {
      try {
        return alpha(color, channelAlpha);
      } catch {
        // Unparseable colour - fall through to the legacy hue.
      }
    }
    return `rgba(${fallbackRgb}, ${channelAlpha})`;
  };

  return {
    sm: `${ringColor(RING_GEOMETRY.sm.alpha)} ${RING_GEOMETRY.sm.offset}`,
    md: `${ringColor(RING_GEOMETRY.md.alpha)} ${RING_GEOMETRY.md.offset}`,
    lg: `${ringColor(RING_GEOMETRY.lg.alpha)} ${RING_GEOMETRY.lg.offset}`,
  };
};

const customShadows = (
  mode: SystemMode,
  brandColors: BrandShadowColors = {},
): Theme["customShadows"] => {
  const opacity =
    mode === "light"
      ? { xs: 0.1, sm: 0.12, md: 0.14, lg: 0.16, xl: 0.18 }
      : { xs: 0.16, sm: 0.18, md: 0.2, lg: 0.22, xl: 0.24 };
  const [r, g, b] = mode === "light" ? [47, 43, 61] : [19, 17, 32];

  return {
    xs: `0px 1px 6px rgba(${r}, ${g}, ${b}, ${opacity.xs})`,
    sm: `0px 2px 8px rgba(${r}, ${g}, ${b}, ${opacity.sm})`,
    md: `0px 3px 12px rgba(${r}, ${g}, ${b}, ${opacity.md})`,
    lg: `0px 4px 18px rgba(${r}, ${g}, ${b}, ${opacity.lg})`,
    xl: `0px 5px 30px rgba(${r}, ${g}, ${b}, ${opacity.xl})`,
    primary: buildColoredRing("primary", brandColors.primary),
    secondary: buildColoredRing("secondary", brandColors.secondary),
    error: buildColoredRing("error", brandColors.error),
    warning: buildColoredRing("warning", brandColors.warning),
    info: buildColoredRing("info", brandColors.info),
    success: buildColoredRing("success", brandColors.success),
  };
};

export const createBaseMuiTheme = (
  settings: Settings,
  mode: SystemMode,
  direction: Direction,
  /**
   * Resolved palette colours for the coloured elevation rings. `composeMuiTheme`
   * passes the tenant's own brand + status colours here; when omitted, each
   * ring keeps its legacy hue (see `buildColoredRing`). `settings.primaryColor`
   * is the last resort for the primary ring specifically, since older callers
   * only ever set that.
   */
  brandColors: BrandShadowColors = {},
): Theme =>
  ({
    direction,
    components: coreOverrides((settings.skin || "default") as Skin),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10,
      },
    },
    shadows: elevationScale(mode),
    customShadows: customShadows(mode, {
      ...brandColors,
      primary: brandColors.primary ?? settings.primaryColor,
    }),
    zIndex: zIndexScale,
    mainColorChannels: {
      light: "47 43 61",
      dark: "225 222 245",
      lightShadow: "47 43 61",
      darkShadow: "19 17 32",
    },
    cap: {
      headerTokens,
      menuTokens,
      footerTokens,
      mainTokens,
      stepperTokens,
      guestNavbarTokens,
      navbarTokens,
      adminMenuTokens,
      layoutMenuTokens,
      searchTokens,
      dropdownTokens,
    },
  }) as unknown as Theme;
