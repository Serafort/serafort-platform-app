import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { PreviewCard } from "./PreviewCard";
import { PreviewButton } from "./PreviewButton";
import { PreviewInput } from "./PreviewInput";
import { PreviewNavbar } from "./PreviewNavbar";
import type { TenantThemeConfig } from "@cap/theme";

interface LivePreviewProps {
  theme: TenantThemeConfig;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ theme }) => {
  const effects = theme.effects || ({} as any);
  const components = theme.components || ({} as any);
  const globalEffectType = effects.globalType || "standard";

  const getEffectStyle = (
    componentKey: keyof typeof components,
  ): "standard" | "glass" | "neu" => {
    const component = components[componentKey];
    const style =
      component?.style === "global"
        ? globalEffectType
        : component?.style || "standard";
    if (style === "glass" || style === "neu") {
      return style;
    }
    return "standard";
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Live Preview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        See how your theme changes affect the UI components in real-time
      </Typography>

      <Box
        sx={{
          backgroundColor: theme.tokens?.colors?.background?.value || "#f8fafc",
          borderRadius: 2,
          p: 2,
          minHeight: 400,
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PreviewNavbar effectStyle={getEffectStyle("navbar")} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Cards
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewCard variant="standard" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewCard
                  variant={
                    effects.glassmorphism?.enabled ? "glass" : "standard"
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewCard
                  variant={effects.neumorphism?.enabled ? "neu" : "standard"}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Buttons
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <PreviewButton effectStyle="standard" />
                <PreviewButton
                  effectStyle={
                    effects.glassmorphism?.enabled ? "glass" : "standard"
                  }
                />
                <PreviewButton
                  effectStyle={
                    effects.neumorphism?.enabled ? "neu" : "standard"
                  }
                />
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Input Fields
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <PreviewInput effectStyle="standard" />
                <PreviewInput
                  effectStyle={
                    effects.glassmorphism?.enabled ? "glass" : "standard"
                  }
                />
                <PreviewInput
                  effectStyle={
                    effects.neumorphism?.enabled ? "neu" : "standard"
                  }
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LivePreview;
