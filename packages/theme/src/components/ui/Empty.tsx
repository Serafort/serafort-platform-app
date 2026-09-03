import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import emptyIllustration from "../../assets/images/empty.png";

export interface EmptyActionConfig {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  color?:
    | "primary"
    | "secondary"
    | "inherit"
    | "error"
    | "info"
    | "success"
    | "warning";
}

export interface EmptyProps {
  /**
   * Main title or heading for the empty state
   */
  title?: React.ReactNode;
  /**
   * Explanatory description giving context or next steps
   */
  description?: React.ReactNode;
  /**
   * Custom icon element or illustration
   */
  icon?: React.ReactNode;
  /**
   * Primary call to action configuration
   */
  action?: EmptyActionConfig;
  /**
   * Custom action node (e.g. custom button group)
   */
  actionNode?: React.ReactNode;
  /**
   * Optional custom illustration source
   */
  imageSrc?: string;
  /**
   * Legacy text prop for backward compatibility
   */
  text?: string;
  /**
   * Legacy showText flag for backward compatibility
   */
  showText?: boolean;
  /**
   * Container width
   */
  width?: string | number;
  /**
   * Container height or minimum height
   */
  height?: string | number;
  /**
   * Additional MUI Sx styling overrides
   */
  sx?: SxProps<Theme>;
}

export default function Empty({
  title,
  description,
  icon,
  action,
  actionNode,
  imageSrc,
  text = "No data found",
  showText,
  width = "100%",
  height = "100%",
  sx,
}: EmptyProps) {
  const theme = useTheme();

  // Backward compatibility: If showText is explicitly false and no title/desc/action provided, show legacy illustration image
  const isLegacyImageOnly =
    showText === false &&
    !title &&
    !description &&
    !action &&
    !actionNode &&
    !icon;

  if (isLegacyImageOnly) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.background.paper,
          width,
          height,
          ...sx,
        }}
      >
        <img
          src={imageSrc || emptyIllustration}
          alt="No data"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    );
  }

  const resolvedTitle =
    title ||
    (showText ? text : text !== "No data found" ? text : "No data found");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 3, sm: 5 },
        textAlign: "center",
        width,
        minHeight: height === "100%" ? 260 : height,
        borderRadius: 3,
        border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(8px)",
        transition: "all 0.2s ease-in-out",
        ...sx,
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={{ maxWidth: 440, width: "100%" }}
      >
        {/* Icon / Graphic Container */}
        {icon !== undefined ? (
          icon && (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 0.5,
              }}
            >
              {icon}
            </Box>
          )
        ) : (
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <InboxOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
        )}

        {/* Title & Description */}
        <Box sx={{ width: "100%" }}>
          {resolvedTitle && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: "-0.01em",
                mb: description ? 0.5 : 0,
              }}
            >
              {resolvedTitle}
            </Typography>
          )}

          {description && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* Standardized Primary CTA / Action Node */}
        {action && (
          <Button
            variant={action.variant || "contained"}
            color={action.color || "primary"}
            startIcon={action.icon}
            onClick={action.onClick}
            href={action.href}
            sx={{
              mt: 1,
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: action.variant === "contained" ? 1 : "none",
            }}
          >
            {action.label}
          </Button>
        )}

        {actionNode}
      </Stack>
    </Box>
  );
}
