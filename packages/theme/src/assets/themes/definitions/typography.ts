export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', Consolas, monospace",
  },
  fontSize: {
    xs: 'clamp(0.7rem, 0.68rem + 0.1vw, 0.75rem)',
    sm: 'clamp(0.8rem, 0.77rem + 0.15vw, 0.875rem)',
    base: 'clamp(0.95rem, 0.9rem + 0.25vw, 1.05rem)',
    lg: 'clamp(1.05rem, 0.98rem + 0.35vw, 1.15rem)',
    xl: 'clamp(1.15rem, 1.05rem + 0.5vw, 1.35rem)',
    '2xl': 'clamp(1.35rem, 1.2rem + 0.75vw, 1.65rem)',
    '3xl': 'clamp(1.6rem, 1.35rem + 1.25vw, 2.1rem)',
    '4xl': 'clamp(2rem, 1.5rem + 2vw, 3rem)',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

export default typography;
