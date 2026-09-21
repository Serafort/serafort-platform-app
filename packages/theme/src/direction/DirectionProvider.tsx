// cspell:ignore stylis
import React, { useMemo, useEffect } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import stylisRTLPlugin from "stylis-plugin-rtl";
import type { Direction } from "@cap/shared-types";

export interface DirectionProviderProps {
  /** Writing direction for the subtree. Derive it from the active locale. */
  direction: Direction;
  /** Active locale, mirrored onto <html lang> for a11y and hyphenation. */
  locale?: string;
  children: React.ReactNode;
}

/**
 * Applies writing direction to the whole app.
 *
 * Two things have to happen together for RTL parity, and previously neither
 * did: MUI's physical `sx` properties must be flipped by `stylis-plugin-rtl`
 * (which requires its own emotion cache), and `<html dir>` must be set so the
 * `[dir='rtl']` CSS in the layout package — chevrons, nav rails — matches.
 *
 * The cache is keyed per direction so emotion keeps LTR and RTL styles in
 * separate stylesheets rather than reusing already-flipped rules.
 */
export const DirectionProvider: React.FC<DirectionProviderProps> = ({
  direction,
  locale,
  children,
}) => {
  const cache = useMemo(
    () =>
      createCache({
        key: direction === "rtl" ? "rtl" : "css",
        prepend: true,
        ...(direction === "rtl" && { stylisPlugins: [stylisRTLPlugin] }),
      }),
    [direction],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("dir", direction);
    if (locale) document.documentElement.setAttribute("lang", locale);
  }, [direction, locale]);

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default DirectionProvider;
