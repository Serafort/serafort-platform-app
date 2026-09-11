import type { Theme } from "@mui/material/styles";

const table: Theme["components"] = {
  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: "var(--sf-radius-lg, var(--radius-lg, 12px))",
        border: `var(--sf-border-1, 1px) solid var(--sf-border, ${theme.palette.divider})`,
        backgroundColor: `var(--surface-paper, ${theme.palette.background.paper})`,
      }),
    },
  },
  MuiTable: {
    defaultProps: {
      stickyHeader: true,
    },
    styleOverrides: {
      root: {
        borderCollapse: "separate",
        borderSpacing: 0,
        width: "100%",
        fontVariantNumeric: "tabular-nums",
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      // No distinct tint band: the header sits on the same surface as the
      // body and reads as a header purely through its typography (uppercase,
      // tracked-out, muted). A solid fill is still required here (not
      // `transparent`) because `MuiTable` defaults to `stickyHeader` -
      // scrolled body rows would otherwise show through underneath it.
      root: ({ theme }) => ({
        backgroundColor: `var(--sf-surface, ${theme.palette.background.paper})`,
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&:last-child .MuiTableCell-root": {
          borderBottom: "none",
        },
        "&.MuiTableRow-hover:hover": {
          backgroundColor: `var(--sf-surface-sunken, ${
            theme.palette.mode === "dark" ? "#0D2653" : "#ECF0F7"
          })`,
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `var(--sf-border-1, 1px) solid var(--sf-border, ${theme.palette.divider})`,
        padding: "var(--sf-space-3, 12px) var(--sf-space-4, 16px)",
        lineHeight: 1.5,
        color: `var(--sf-text-primary, ${theme.palette.text.primary})`,
      }),
      head: ({ theme }) => ({
        fontFamily: "ui-monospace, monospace",
        fontSize: "var(--sf-text-2xs, 0.6875rem)",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: `var(--sf-text-tertiary, ${theme.palette.text.disabled})`,
        borderBottom: `var(--sf-border-1, 1px) solid var(--sf-border, ${theme.palette.divider})`,
      }),
      body: ({ theme }) => ({
        fontSize: "var(--sf-text-base, 0.875rem)",
        color: `var(--sf-text-primary, ${theme.palette.text.primary})`,
      }),
      sizeSmall: {
        padding: "var(--sf-space-2, 8px) var(--sf-space-3, 12px)",
      },
    },
  },
};

export default table;
