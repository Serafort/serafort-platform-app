import type { Theme } from "@mui/material/styles";
import type { Skin } from "@cap/shared-types";

const dialog = (skin: Skin): Theme["components"] => ({
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius:
          "var(--form-modal-radius, var(--radius-xl, var(--mui-shape-customBorderRadius-lg, 16px)))",
        // Same chain as MuiCard/MuiPaper: --effect-bg/--effect-backdrop are
        // what the active global effect (glass, brutalism, bento, organic)
        // paints a surface with, and the chain has to end at a real theme
        // value because `--mui-*` names never exist outside MUI's CSS
        // variables mode, which this app does not use.
        backgroundColor: `var(--effect-bg, var(--surface-paper, ${theme.palette.background.paper}))`,
        backdropFilter: "var(--effect-backdrop, none)",
        maxWidth: "var(--form-modal-max-width, 480px)",
        ...(skin !== "bordered"
          ? {
              boxShadow: `var(--effect-shadow, ${(theme as Theme).customShadows.lg})`,
            }
          : {
              boxShadow: "none",
            }),
        [theme.breakpoints.down("sm")]: {
          margin: theme.spacing(6),
        },
      }),
      paperFullScreen: {
        borderRadius: 0,
        maxWidth: "100%",
      },
    },
  },
  MuiDialogTitle: {
    defaultProps: {
      variant: "h5",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        "& + .MuiDialogActions-root": {
          paddingTop: 0,
        },
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        "& + .MuiDialogContent-root, & + .MuiDialogActions-root": {
          paddingTop: 0,
        },
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        "& .MuiButtonBase-root:not(:first-of-type)": {
          marginInlineStart: theme.spacing(4),
        },
        "&:where(.dialog-actions-dense)": {
          padding: theme.spacing(3),
          "& .MuiButton-text": {
            paddingInline: theme.spacing(3),
          },
        },
      }),
    },
  },
});

export default dialog;
