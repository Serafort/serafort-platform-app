import React from "react";
import { Box, useTheme } from "@mui/material";
import { PreviewCard } from "./PreviewCard";
import { PreviewButton } from "./PreviewButton";
import { PreviewInput } from "./PreviewInput";
import { PreviewNavbar } from "./PreviewNavbar";
import type { TenantThemeConfig } from "@cap/theme";
import { AutoGrid, PanelHeader, SectionLabel, useSurfaceSx } from "../studioUi";

interface LivePreviewProps {
  theme: TenantThemeConfig;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ theme }) => {
  const muiTheme = useTheme();
  const surface = useSurfaceSx();
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

  const glass = effects.glassmorphism?.enabled ? "glass" : "standard";
  const neu = effects.neumorphism?.enabled ? "neu" : "standard";

  return (
    <Box sx={{ ...surface, p: 5 }}>
      <PanelHeader
        title="Live preview"
        description="Your tokens on real components, updating as you edit."
      />

      {/* The stage sits on the tenant's own background so the components are
          judged against the surface they will actually live on. */}
      <Box
        sx={{
          backgroundColor: theme.tokens?.colors?.background?.value || "#f8fafc",
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: 1.5,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <Box>
          <SectionLabel>Navigation</SectionLabel>
          <PreviewNavbar effectStyle={getEffectStyle("navbar")} />
        </Box>

        <Box>
          <SectionLabel>Cards</SectionLabel>
          {/* AutoGrid reflows on this stage's width rather than the browser
              viewport, so the preview stays honest inside the editor drawer. */}
          <AutoGrid min={150} gap={3}>
            <PreviewCard variant="standard" />
            <PreviewCard variant={glass} />
            <PreviewCard variant={neu} />
          </AutoGrid>
        </Box>

        <AutoGrid min={220} gap={7}>
          <Box>
            <SectionLabel>Buttons</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <PreviewButton effectStyle="standard" />
              <PreviewButton effectStyle={glass} />
              <PreviewButton effectStyle={neu} />
            </Box>
          </Box>

          <Box>
            <SectionLabel>Inputs</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <PreviewInput effectStyle="standard" />
              <PreviewInput effectStyle={glass} />
              <PreviewInput effectStyle={neu} />
            </Box>
          </Box>
        </AutoGrid>
      </Box>
    </Box>
  );
};

export default LivePreview;
