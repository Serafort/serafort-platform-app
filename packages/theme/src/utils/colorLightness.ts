/**
 * Relative lightness of a colour, 0 (black) to 1 (white). Accepts the hex and
 * rgb()/rgba() forms the token layer produces; anything else returns null so
 * the caller can fall back rather than guess.
 *
 * Shared so that the two places which judge "is this colour a light one or a
 * dark one" - composeMuiTheme's chrome-colour guard and the preset layer's
 * intended-mode lookup - can never disagree about the answer.
 */
export const lightnessOf = (color: string): number | null => {
  if (!color) return null;

  let r: number, g: number, b: number;
  const hex = color.trim();

  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (/^#[0-9a-f]{6,8}$/i.test(hex)) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    const m = hex.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return null;
    [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  }

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/** The lightness above which a colour reads as a "light" surface. */
export const LIGHT_SURFACE_THRESHOLD = 0.5;
