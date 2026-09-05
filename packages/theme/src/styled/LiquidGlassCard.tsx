import React from "react";
import { styled, alpha } from "@mui/material/styles";
import type { CSSProperties, ReactNode } from "react";
import {
  getThemeBorderRadius,
  resolveComponentCustomProperties,
} from "../utils/themeObjectStyles";

export interface LiquidGlassCardProps {
  children: ReactNode;
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
  borderRadius?: string;
  padding?: string;
  innerShadow?: string;
  specularHighlight?: string;
  style?: CSSProperties;
  className?: string;
}

const StyledLiquidGlassCard = styled("div")<
  Omit<LiquidGlassCardProps, "children">
>(({
  theme,
  blur,
  background,
  borderColor,
  borderWidth,
  opacity,
  borderRadius,
  padding,
  innerShadow,
  specularHighlight,
}) => {
  const isLight = theme.palette.mode === "light";
  const resolvedOpacity = opacity ?? (isLight ? 0.82 : 0.75);
  const resolvedBackground =
    background ||
    (isLight
      ? alpha(theme.palette.background.paper || "#ffffff", resolvedOpacity)
      : alpha(theme.palette.background.paper || "#032457", resolvedOpacity));

  const resolvedBorderColor =
    borderColor ||
    (isLight ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.12)");
  const resolvedBorderWidth = borderWidth || "1px";
  const resolvedBlur = blur || "24px";

  const resolvedInnerShadow =
    innerShadow ||
    (isLight
      ? "inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.06)"
      : "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.35)");

  const resolvedSpecular =
    specularHighlight ||
    (isLight
      ? "0 12px 36px 0 rgba(31, 38, 135, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.04)"
      : "0 12px 36px 0 rgba(0, 0, 0, 0.6), 0 2px 8px 0 rgba(0, 0, 0, 0.4)");

  return {
    background: resolvedBackground,
    backdropFilter: `blur(${resolvedBlur}) saturate(180%)`,
    WebkitBackdropFilter: `blur(${resolvedBlur}) saturate(180%)`,
    border: `${resolvedBorderWidth} solid ${resolvedBorderColor}`,
    borderRadius:
      borderRadius ||
      getThemeBorderRadius(theme, theme.shape.customBorderRadius?.lg || 16),
    padding: padding || theme.spacing(3.5),
    boxShadow: `${resolvedInnerShadow}, ${resolvedSpecular}`,
    transition: "all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)",
    position: "relative",
    overflow: "hidden",
    ...resolveComponentCustomProperties(theme, "card"),
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "40%",
      background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%)",
      pointerEvents: "none",
    },
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: `${resolvedInnerShadow}, ${
        isLight
          ? "0 18px 48px 0 rgba(31, 38, 135, 0.18), 0 4px 12px 0 rgba(0, 0, 0, 0.06)"
          : "0 18px 48px 0 rgba(0, 0, 0, 0.75), 0 4px 14px 0 rgba(0, 0, 0, 0.5)"
      }`,
      borderColor: isLight
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(255, 255, 255, 0.25)",
    },
  };
});

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  ...props
}) => {
  return <StyledLiquidGlassCard {...props}>{children}</StyledLiquidGlassCard>;
};

export default LiquidGlassCard;
