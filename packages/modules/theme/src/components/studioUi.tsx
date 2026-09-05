import React from "react";
import {
  Box,
  Chip,
  Slider,
  Switch,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

/*
 * Shared building blocks for the theme editor's panels.
 *
 * Every tab in this module is a list of labelled controls on a small number
 * of surfaces, and before this file each one invented its own version of that
 * (Paper + h6 + body2 here, bordered Box + subtitle2 there, chips styled three
 * different ways). These primitives give the whole editor one vocabulary, so a
 * slider in Effects and a slider in Spacing are the same object to the eye.
 *
 * A NOTE ON SPACING NUMBERS
 *
 * composeMuiTheme overrides theme.spacing to `var(--spacing-N, calc(0.25rem *
 * N))`, and no numeric `--spacing-N` variables are emitted (only the named
 * xs/sm/md/lg/xl ones), so every sx spacing value in this module resolves
 * against a 4px unit - half of MUI's usual 8px. `p: 4` is 16px, `gap: 7` is
 * 28px. Values here are therefore roughly double what the same design would
 * use in a stock MUI app, chosen to land on what the design system asks for:
 * 4-8px between tightly coupled controls, 24-32px between sections.
 *
 * Border-radius numbers are unaffected - those multiply theme.shape
 * .borderRadius (the tenant's own `md` radius token, 8px by default), so
 * `borderRadius: 1.5` is 12px and follows the tenant to 0 under a brutalist
 * preset.
 */

export const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

export const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

/**
 * The one surface recipe in this module: a hairline border, the tenant's own
 * radius, and the paper background. Everything that needs to read as "a thing"
 * uses it, so boundaries mean the same everywhere.
 */
export const useSurfaceSx = (): SxProps<Theme> => {
  const theme = useTheme();
  return {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1.5,
    bgcolor: "background.paper",
  };
};

/** Focus ring shared by every custom (non-MUI) interactive element here. */
export const useFocusRingSx = () => {
  const theme = useTheme();
  return {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  };
};

/**
 * Small-caps heading for a group of controls. Structure is carried by
 * typography and whitespace rather than by another nested card.
 */
export const SectionLabel: React.FC<{
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ children, action }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      mb: 3,
    }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: 600,
        letterSpacing: "0.08em",
        lineHeight: 1,
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
    {action}
  </Box>
);

/**
 * The title block at the top of a tab. Replaces the h6 + body2 pair each panel
 * used to write out by hand at a different size.
 */
export const PanelHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 3,
      mb: 5,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, lineHeight: 1.5 }}
        >
          {description}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);

/** Label above a single control, with an optional right-aligned value. */
export const FieldLabel: React.FC<{
  children: React.ReactNode;
  value?: React.ReactNode;
  hint?: React.ReactNode;
}> = ({ children, value, hint }) => (
  <Box sx={{ mb: 2 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
      {value !== undefined && (
        <Typography
          variant="caption"
          sx={{ fontFamily: "monospace", color: "text.secondary" }}
        >
          {value}
        </Typography>
      )}
    </Box>
    {hint && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5 }}
      >
        {hint}
      </Typography>
    )}
  </Box>
);

/**
 * Label + live value + slider. Effects alone had six of these written out
 * long-hand, each with slightly different label markup.
 */
export const SliderField: React.FC<{
  label: string;
  value: number;
  displayValue: React.ReactNode;
  hint?: React.ReactNode;
  min: number;
  max: number;
  step?: number;
  marks?: Array<{ value: number; label: string }>;
  onChange: (value: number) => void;
}> = ({
  label,
  value,
  displayValue,
  hint,
  min,
  max,
  step = 1,
  marks,
  onChange,
}) => (
  <Box sx={{ mb: 6 }}>
    <FieldLabel value={displayValue} hint={hint}>
      {label}
    </FieldLabel>
    <Box sx={{ paddingInline: 1 }}>
      <Slider
        value={value}
        onChange={(_, next) => onChange(next as number)}
        min={min}
        max={max}
        step={step}
        marks={marks}
        size="small"
        aria-label={label}
        valueLabelDisplay="auto"
      />
    </Box>
  </Box>
);

/**
 * Pill-shaped single choice. Selected reads as a filled brand chip; the rest
 * stay quiet outlines so the current value is the only thing that pops.
 */
export const ChoiceChip: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => {
  const theme = useTheme();
  return (
    <Chip
      label={label}
      clickable
      aria-pressed={selected}
      onClick={onClick}
      sx={{
        blockSize: 34,
        borderRadius: 1,
        fontSize: "0.75rem",
        fontWeight: 600,
        border: `1px solid ${selected ? "transparent" : theme.palette.divider}`,
        bgcolor: selected ? "primary.main" : "transparent",
        color: selected ? "primary.contrastText" : "text.secondary",
        "&:hover": {
          bgcolor: selected
            ? "primary.dark"
            : alpha(theme.palette.primary.main, 0.06),
        },
      }}
    />
  );
};

/** Header row for a feature that can be switched on and off wholesale. */
export const SwitchHeader: React.FC<{
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 3,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}
        >
          {description}
        </Typography>
      )}
    </Box>
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      inputProps={{ "aria-label": `Enable ${title}` }}
    />
  </Box>
);

/**
 * The "nothing to configure yet" state. The design system asks for a real
 * empty state rather than a line of italic apology text.
 */
export const EmptyHint: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 6,
        textAlign: "center",
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
};

/** Responsive grid that reflows on the *container's* width, not the viewport. */
export const AutoGrid: React.FC<{
  min?: number;
  gap?: number;
  children: React.ReactNode;
}> = ({ min = 220, gap = 3, children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      gap,
    }}
  >
    {children}
  </Box>
);

/**
 * A colour chip + its hex, used wherever a palette value is shown read-only.
 */
export const SwatchReadout: React.FC<{
  label: string;
  hex: string;
  size?: number;
}> = ({ label, hex, size = 28 }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
      <Box
        sx={{
          inlineSize: size,
          blockSize: size,
          borderRadius: 0.75,
          bgcolor: hex,
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ display: "block", fontWeight: 600, ...ellipsis }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontFamily: "monospace", ...ellipsis }}
        >
          {hex}
        </Typography>
      </Box>
    </Box>
  );
};
