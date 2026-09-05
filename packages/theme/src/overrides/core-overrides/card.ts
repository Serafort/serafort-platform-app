import type { Theme } from "@mui/material/styles";
import type { Skin } from "@cap/shared-types";

const card = (skin: Skin): Theme["components"] => {
  return {
    MuiCard: {
      defaultProps: {
        ...(skin === "bordered" && {
          variant: "outlined",
        }),
      },
      styleOverrides: {
        // Every `--mui-*` name below used to sit at the end of a fallback
        // chain, but this app builds its theme with a plain createTheme, so
        // MUI's CSS-variable mode is off and none of them are ever defined -
        // and an invalid var() resolves to the property's initial value, not
        // to the theme. That is why cards rendered transparent and unshadowed.
        // Each chain now ends at a real value read from the theme, which
        // composeMuiTheme rebuilds per mode.
        root: ({ ownerState, theme }) => ({
          borderRadius:
            "var(--bento-radius, var(--comp-card-border-radius, var(--radius-lg, 12px)))",
          backgroundColor: `var(--surface-paper, var(--effect-bg, ${theme.palette.background.paper}))`,
          borderColor: `var(--surface-border, var(--glass-border, ${theme.palette.divider}))`,
          // `--glass-blur` is a raw length (16px) - it backs per-component
          // opt-in glass, where it is wrapped in blur() at the point of use.
          // Reading it here handed backdrop-filter a bare length, which is not
          // a filter function, so the declaration was dropped and glass cards
          // never actually frosted anything. `--effect-backdrop` is the
          // ready-made `blur(...)` the effect layer emits for exactly this.
          backdropFilter: "var(--effect-backdrop, none)",
          ...(ownerState.variant !== "outlined" && {
            boxShadow: `var(--glass-shadow, var(--effect-shadow, var(--comp-card-box-shadow, ${(theme as Theme).customShadows.md})))`,
          }),
        }),
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme: _theme }) => ({
          padding: "var(--comp-card-padding, var(--mui-spacing-6, 24px))",
          "& + .MuiCardContent-root, & + .MuiCardActions-root": {
            paddingBlockStart: 0,
          },
          "& + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type":
            {
              paddingBlockStart: 0,
            },
        }),
        subheader: ({ theme }) => ({
          ...theme.typography.subtitle1,
          color: "rgb(var(--mui-palette-text-primaryChannel) / 0.55)",
        }),
        action: ({ theme }) => ({
          ...theme.typography.body1,
          color: "var(--mui-palette-text-disabled)",
          marginBlock: 0,
          marginInlineEnd: 0,
          "& .MuiIconButton-root": {
            color: "inherit",
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme: _theme }) => ({
          padding: "var(--comp-card-padding, var(--mui-spacing-6, 24px))",
          color: "var(--mui-palette-text-secondary)",
          "&:last-child": {
            paddingBlockEnd:
              "var(--comp-card-padding, var(--mui-spacing-6, 24px))",
          },
          "& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root":
            {
              paddingBlockStart: 0,
            },
          "& + .MuiCollapse-root .MuiCardHeader-root:first-of-type, & + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type":
            {
              paddingBlockStart: 0,
            },
          "& > .MuiTabPanel-root": {
            paddingInline: 0,
            paddingBlockEnd: 0,
            "&:first-of-type": {
              paddingBlockStart: 0,
              "& ~ .MuiTabPanel-root": {
                paddingBlockStart: 0,
              },
            },
          },
        }),
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "var(--comp-card-padding, var(--mui-spacing-6, 24px))",
          "&:where(.card-actions-dense)": {
            padding:
              "var(--comp-card-padding-dense, var(--mui-spacing-3, 12px))",
            "& .MuiButton-text": {
              paddingInline: theme.spacing(3),
            },
          },
          "& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root":
            {
              paddingBlockStart: 0,
            },
          "& + .MuiCollapse-root .MuiCardHeader-root:first-of-type, & + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type":
            {
              paddingBlockStart: 0,
            },
        }),
      },
    },
  };
};

export default card;
