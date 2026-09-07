import React from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Serafort icon mark, from the brand kit's `icons/` set (served out of
 * `app/public/brand/logo`).
 *
 * The square icon is used rather than a `logo-lockups/` wordmark: those lockups
 * are ~1662x302, so sizing one by width renders the name a few pixels tall.
 * Sized by height with `width: auto` so the mark stays proportionate.
 */
const LOGO_SRC = {
  light: "/brand/logo/icon-color.svg",
  dark: "/brand/logo/icon-white.png",
} as const;

const Logo = (props: React.SVGAttributes<SVGElement>) => {
  const theme = useTheme();
  const src = theme.palette.mode === "dark" ? LOGO_SRC.dark : LOGO_SRC.light;

  return (
    <img
      src={src}
      alt="Serafort"
      style={{
        height: "2rem",
        width: "auto",
        objectFit: "contain",
        flexShrink: 0,
        ...props.style,
      }}
    />
  );
};

export default Logo;
