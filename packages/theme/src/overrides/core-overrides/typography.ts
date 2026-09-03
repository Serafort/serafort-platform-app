import type { Theme } from "@mui/material/styles";
import { fluidTypographyTokens } from "../../tokens/semantics";

const typography: Theme["components"] = {
  MuiTypography: {
    styleOverrides: {
      gutterBottom: ({ theme }) => ({
        marginBottom: theme.spacing(2),
      }),
    },
    variants: [
      {
        props: { variant: "h1" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h1,
          lineHeight: 1.2,
          fontWeight: 700,
        },
      },
      {
        props: { variant: "h2" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h2,
          lineHeight: 1.25,
          fontWeight: 700,
        },
      },
      {
        props: { variant: "h3" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h3,
          lineHeight: 1.3,
          fontWeight: 600,
        },
      },
      {
        props: { variant: "h4" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h4,
          lineHeight: 1.35,
          fontWeight: 600,
        },
      },
      {
        props: { variant: "h5" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h5,
          lineHeight: 1.4,
          fontWeight: 600,
        },
      },
      {
        props: { variant: "h6" },
        style: {
          color: "var(--mui-palette-text-primary)",
          fontSize: fluidTypographyTokens.h6,
          lineHeight: 1.45,
          fontWeight: 600,
        },
      },
      {
        props: { variant: "subtitle1" },
        style: {
          color: "rgb(var(--mui-palette-text-primaryChannel) / 0.55)",
          fontSize: fluidTypographyTokens.subtitle1,
          lineHeight: 1.5,
        },
      },
      {
        props: { variant: "subtitle2" },
        style: {
          color: "rgb(var(--mui-palette-text-primaryChannel) / 0.55)",
          fontSize: fluidTypographyTokens.subtitle2,
          lineHeight: 1.5,
        },
      },
      {
        props: { variant: "body1" },
        style: {
          color: "var(--mui-palette-text-secondary)",
          fontSize: fluidTypographyTokens.body1,
          lineHeight: 1.55,
        },
      },
      {
        props: { variant: "body2" },
        style: {
          color: "var(--mui-palette-text-secondary)",
          fontSize: fluidTypographyTokens.body2,
          lineHeight: 1.5,
        },
      },
      {
        props: { variant: "button" },
        style: { color: "var(--mui-palette-text-primary)" },
      },
      {
        props: { variant: "caption" },
        style: {
          color: "var(--mui-palette-text-disabled)",
          fontSize: fluidTypographyTokens.caption,
        },
      },
      {
        props: { variant: "overline" },
        style: { color: "var(--mui-palette-text-primary)" },
      },
    ],
  },
};

export default typography;
