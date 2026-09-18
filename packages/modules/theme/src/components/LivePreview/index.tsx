import React from "react";
import { Box, useTheme } from "@mui/material";
import { PreviewCard } from "./PreviewCard";
import { PreviewButton } from "./PreviewButton";
import { PreviewInput } from "./PreviewInput";
import { PreviewNavbar } from "./PreviewNavbar";
import type { EffectType, TenantThemeConfig } from "@cap/theme";
import { EFFECT_TYPES } from "@cap/theme";
import { AutoGrid, PanelHeader, SectionLabel, useSurfaceSx } from "../studioUi";

interface LivePreviewProps {
  theme: TenantThemeConfig;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ theme }) => {
  const muiTheme = useTheme();
  const surface = useSurfaceSx();
  const effects = theme.effects || ({} as any);
  const components = theme.components || ({} as any);
  const globalEffectType: EffectType = effects.globalType || "standard";
  const effectLabel = EFFECT_TYPES.find(
    (option) => option.value === globalEffectType,
  )?.label;

  // The preview used to show a glass row and a neumorphic row side by side
  // whenever either config had `enabled` set, whatever the selected effect
  // actually was - so it advertised effects that were not applied and stayed
  // silent about the six it had no variant for. Each row now shows the plain
  // baseline next to whatever effect is genuinely active, and the effect side
  // is drawn from the same --effect-* variables the app paints with.
  const getEffectStyle = (
    componentKey: keyof typeof components,
  ): "standard" | "effect" => {
    const component = components[componentKey];
    const style =
      component?.style === "global"
        ? globalEffectType
        : component?.style || "standard";
    return style === "standard" ? "standard" : "effect";
  };

  const activeVariant: "standard" | "effect" =
    globalEffectType === "standard" ? "standard" : "effect";

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
          <PreviewNavbar
            effectStyle={getEffectStyle("navbar")}
            label={effectLabel}
          />
        </Box>

        <Box>
          <SectionLabel>Cards</SectionLabel>
          {/* AutoGrid reflows on this stage's width rather than the browser
              viewport, so the preview stays honest inside the editor drawer. */}
          <AutoGrid min={150} gap={3}>
            <PreviewCard variant="standard" />
            <PreviewCard variant={activeVariant} label={effectLabel} />
          </AutoGrid>
        </Box>

        <AutoGrid min={220} gap={7}>
          <Box>
            <SectionLabel>Buttons</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <PreviewButton effectStyle="standard" />
              <PreviewButton
                effectStyle={getEffectStyle("button")}
                label={effectLabel}
              />
            </Box>
          </Box>

          <Box>
            <SectionLabel>Inputs</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <PreviewInput effectStyle="standard" />
              <PreviewInput
                effectStyle={getEffectStyle("input")}
                label={effectLabel}
              />
            </Box>
          </Box>
        </AutoGrid>
      </Box>
    </Box>
  );
};

export default LivePreview;
