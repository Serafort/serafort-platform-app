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
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: `var(--sf-surface-sunken, ${theme.palette.mode === "dark" ? "#0D2653" : "#ECF0F7"})`,
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
          backgroundColor: `var(--table-row-hover, ${
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(3, 20, 51, 0.02)"
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
        fontSize: "var(--sf-text-xs, 0.75rem)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: `var(--sf-text-secondary, ${theme.palette.text.secondary})`,
        backgroundColor: `var(--sf-surface-sunken, ${theme.palette.mode === "dark" ? "#0D2653" : "#ECF0F7"})`,
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
