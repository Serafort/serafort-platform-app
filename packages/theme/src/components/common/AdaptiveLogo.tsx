import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, SxProps, Theme } from "@mui/material";

/**
 * Serafort icon mark, served from the brand kit assets in `app/public/brand`.
 *
 * Uses the square mark from the brand kit's `icons/` set, not a
 * `logo-lockups/` wordmark: the lockups are ~1662x302, so any slot that sizes
 * by width renders the name only a few pixels tall. The lockups stay available
 * under `/brand/logo/logo-horizontal-*.png` for wide surfaces (splash panels,
 * email headers, marketing pages) that have room for the full aspect ratio.
 *
 * The brand kit ships purpose-built colour and white variants, so the mark is
 * swapped per mode rather than filtered - a brightness filter on the colour
 * mark shifts the brand blues off-spec.
 */
const LOGO_SRC = {
  light: "/brand/logo/icon-color.svg",
  dark: "/brand/logo/icon-white.png",
} as const;

export interface AdaptiveLogoProps {
  /** Defaults to `auto` so the near-square mark stays proportionate. */
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
}

export function AdaptiveLogo({
  width = "auto",
  height = 80,
  sx,
}: AdaptiveLogoProps) {
  const theme = useTheme();
  const src = theme.palette.mode === "dark" ? LOGO_SRC.dark : LOGO_SRC.light;

  return (
    <Box
      component="img"
      src={src}
      alt="Serafort"
      sx={{
        width,
        height,
        objectFit: "contain",
        flexShrink: 0,
        ...sx,
      }}
    />
  );
}

export default AdaptiveLogo;
