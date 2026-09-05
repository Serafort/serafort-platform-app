import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Alert,
  Snackbar,
  Drawer,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { AiThemeStudioPanel } from "../components/AiThemeStudioPanel";
import { ColorPaletteEditor } from "../components/ColorPaletteEditor";
import { GlassmorphismPanel } from "../components/EffectControls/GlassmorphismPanel";
import { NeumorphismPanel } from "../components/EffectControls/NeumorphismPanel";
import { ComponentStyleSelector } from "../components/ComponentStyleSelector";
import { SpacingEditor } from "../components/SpacingEditor";
import { PresetSelector } from "../components/PresetSelector";
import { LivePreview } from "../components/LivePreview";
import type {
  TenantThemeConfig,
  ColorToken,
  GlassmorphismConfig,
  NeumorphismConfig,
  ComponentStyles,
  EffectType,
} from "@cap/theme";
import {
  DEFAULT_TENANT_THEME,
  THEME_PRESETS,
  getPresetMode,
  mergeThemeWithPreset,
  useThemeEditorStore,
  themeEditorStore,
} from "@cap/theme";
import type { ThemePresetId } from "@cap/theme";
import { useSettings } from "@cap/platform-store";
import { useTenantTheme, useUpdateTenantTheme } from "../hooks/useThemeQuery";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && <Box>{children}</Box>}
  </div>
);

export interface ThemeEditorProps {
  initialTheme?: TenantThemeConfig;
  organizationId?: string;
  onSave?: (theme: TenantThemeConfig) => Promise<void>;
  asDrawer?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  initialTheme,
  organizationId = "current",
  onSave,
  asDrawer = false,
  open: customOpen,
  onClose,
}) => {
  const { data: serverThemeData, isLoading: isLoadingServerTheme } =
    useTenantTheme(organizationId, {
      enabled: !initialTheme, // Only fetch if no initialTheme provided
    });

  const updateMutation = useUpdateTenantTheme(organizationId);

  const { isEditing, draftConfig } = useThemeEditorStore();
  const { settings, updateSettings } = useSettings();

  const activeInitialTheme =
    initialTheme || serverThemeData?.data?.themeConfig || DEFAULT_TENANT_THEME;
  const rawTheme = draftConfig || activeInitialTheme;

  const theme: TenantThemeConfig = React.useMemo(() => {
    return {
      ...DEFAULT_TENANT_THEME,
      ...rawTheme,
      tokens: {
        ...DEFAULT_TENANT_THEME.tokens,
        ...(rawTheme?.tokens || {}),
        colors: {
          ...DEFAULT_TENANT_THEME.tokens?.colors,
          ...(rawTheme?.tokens?.colors || {}),
        },
        spacing: {
          ...DEFAULT_TENANT_THEME.tokens?.spacing,
          ...(rawTheme?.tokens?.spacing || {}),
        },
        borderRadius: {
          ...DEFAULT_TENANT_THEME.tokens?.borderRadius,
          ...(rawTheme?.tokens?.borderRadius || {}),
        },
        typography: {
          ...DEFAULT_TENANT_THEME.tokens?.typography,
          ...(rawTheme?.tokens?.typography || {}),
        },
      },
      effects: {
        ...DEFAULT_TENANT_THEME.effects,
        ...(rawTheme?.effects || {}),
        glassmorphism: {
          ...DEFAULT_TENANT_THEME.effects?.glassmorphism,
          ...(rawTheme?.effects?.glassmorphism || {}),
        },
        neumorphism: {
          ...DEFAULT_TENANT_THEME.effects?.neumorphism,
          ...(rawTheme?.effects?.neumorphism || {}),
        },
      },
      components: {
        ...DEFAULT_TENANT_THEME.components,
        ...(rawTheme?.components || {}),
      },
    };
  }, [draftConfig, activeInitialTheme, rawTheme]);

  const updateThemeState = useCallback(
    (updater: (prev: TenantThemeConfig) => TenantThemeConfig) => {
      if (!draftConfig) {
        themeEditorStore.startEditing(theme);
      }
      themeEditorStore.setDraftConfig((prev) => updater(prev || theme));
    },
    [draftConfig, theme],
  );

  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const isOpen = customOpen !== undefined ? customOpen : isEditing;

  // Escape closes the drawer. The temporary Drawer this used to be got that
  // for free from its Modal; the persistent one below has no Modal, so the
  // shortcut is wired by hand. Declared up here, above the loading early
  // return, because hooks cannot live after a conditional return.
  React.useEffect(() => {
    if (!asDrawer || !isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      themeEditorStore.discardDraft();
      onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [asDrawer, isOpen, onClose]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleColorsChange = useCallback(
    (colors: Record<string, ColorToken>) => {
      updateThemeState((prev) => ({
        ...prev,
        tokens: {
          ...DEFAULT_TENANT_THEME.tokens,
          ...prev?.tokens,
          colors: {
            ...DEFAULT_TENANT_THEME.tokens?.colors,
            ...prev?.tokens?.colors,
            ...colors,
          } as TenantThemeConfig["tokens"]["colors"],
        },
      }));
    },
    [updateThemeState],
  );

  const handleGlassmorphismChange = useCallback(
    (glassmorphism: GlassmorphismConfig) => {
      updateThemeState((prev) => ({
        ...prev,
        effects: {
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          glassmorphism,
          globalType: glassmorphism.enabled
            ? "glass"
            : prev?.effects?.globalType || "none",
        },
      }));
    },
    [updateThemeState],
  );

  const handleNeumorphismChange = useCallback(
    (neumorphism: NeumorphismConfig) => {
      updateThemeState((prev) => ({
        ...prev,
        effects: {
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          neumorphism,
          globalType: neumorphism.enabled
            ? "neu"
            : prev?.effects?.globalType || "none",
        },
      }));
    },
    [updateThemeState],
  );

  const handleComponentsChange = useCallback(
    (components: ComponentStyles) => {
      updateThemeState((prev) => ({
        ...prev,
        components,
      }));
    },
    [updateThemeState],
  );

  const handleGlobalEffectChange = useCallback(
    (globalType: EffectType) => {
      updateThemeState((prev) => ({
        ...prev,
        effects: {
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          globalType,
        },
      }));
    },
    [updateThemeState],
  );

  const handleSpacingChange = useCallback(
    (spacing: Record<string, string>) => {
      updateThemeState((prev) => ({
        ...prev,
        tokens: {
          ...DEFAULT_TENANT_THEME.tokens,
          ...prev?.tokens,
          spacing,
        },
      }));
    },
    [updateThemeState],
  );

  const handleBorderRadiusChange = useCallback(
    (borderRadius: Record<string, string>) => {
      updateThemeState((prev) => ({
        ...prev,
        tokens: {
          ...DEFAULT_TENANT_THEME.tokens,
          ...prev?.tokens,
          borderRadius,
        },
      }));
    },
    [updateThemeState],
  );

  const handlePresetSelect = useCallback(
    (presetId: ThemePresetId) => {
      updateThemeState((prev) => ({
        ...mergeThemeWithPreset(prev || DEFAULT_TENANT_THEME, presetId),
        organizationId,
      }));

      // A preset is authored for one mode, and its surface, text and border
      // colours are dropped by composeMuiTheme when they do not suit the mode
      // the app is currently in - see getPresetMode. Move the app to the
      // preset's own mode so the result matches the card that was clicked,
      // and say so, because a mode flip the user did not ask for should never
      // be silent.
      const presetMode = getPresetMode(presetId);
      const switchedMode = settings.mode !== presetMode;
      if (switchedMode) {
        updateSettings({ mode: presetMode });
      }

      const presetName = THEME_PRESETS[presetId]?.name ?? "Preset";
      setSnackbar({
        open: true,
        message: switchedMode
          ? `${presetName} applied — switched to ${presetMode} mode.`
          : `${presetName} applied.`,
        severity: "success",
      });
    },
    [organizationId, settings.mode, updateSettings, updateThemeState],
  );

  if (isLoadingServerTheme && !initialTheme) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(theme);
      } else {
        await updateMutation.mutateAsync({
          themeConfig: theme,
          isDark: theme.metadata?.mode === "dark",
        });
      }
      themeEditorStore.discardDraft();
      setSnackbar({
        open: true,
        message: "Theme saved successfully!",
        severity: "success",
      });
      if (onClose) onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save theme. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    updateThemeState(() => ({ ...DEFAULT_TENANT_THEME, organizationId }));
    setSnackbar({
      open: true,
      message: "Theme reset to default.",
      severity: "info",
    });
  };

  const handleDiscard = () => {
    themeEditorStore.discardDraft();
    if (onClose) onClose();
  };

  // Shared source of truth for the tab strip - rendered as MUI `Tabs` on the
  // full-page (wide) layout, where a single scrollable row is the familiar,
  // space-efficient pattern (Jakob's Law), but as a wrapping button group in
  // the drawer, where that same scrollable row was clipping "Components" mid
  // -word and hiding "Spacing" behind a scroll gesture entirely - Hick's Law
  // and Miller's Law both favor every one of these 6 sections staying
  // visible at a glance over a technically-more-compact hidden-overflow row.
  const tabItems: Array<{ label: string; icon?: React.ReactElement }> = [
    { label: "AI Studio", icon: <AutoAwesomeIcon sx={{ fontSize: 18 }} /> },
    { label: "Presets" },
    { label: "Colors" },
    { label: "Effects" },
    { label: "Components" },
    { label: "Spacing" },
  ];

  const content = (
    <Container
      maxWidth={asDrawer ? false : "xl"}
      sx={{
        // theme.spacing is on a 4px unit here (composeMuiTheme maps it to
        // `calc(0.25rem * N)`), so these are 20px block / 16px inline in the
        // drawer - the old py:3 px:2 came out at 12px/8px, which read as the
        // content being jammed against the panel edge.
        py: asDrawer ? 5 : 3,
        px: asDrawer ? 4 : undefined,
        width: asDrawer ? 560 : undefined,
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Theme Customization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time multi-tenant theme builder
          </Typography>
        </Box>
        {/* minHeight/width: 44 on every control here meets the 44x44
            minimum touch target Fitts's Law calls for - these are the most
            frequently reached-for actions in the whole panel. */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            sx={{ minHeight: 44 }}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{ minHeight: 44 }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          {asDrawer && (
            <IconButton
              onClick={handleDiscard}
              aria-label="close"
              sx={{ width: 44, height: 44 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: asDrawer ? 12 : 8 }}>
          {asDrawer ? (
            <Box
              role="tablist"
              aria-label="Theme editor sections"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              {tabItems.map((item, index) => (
                <Button
                  key={item.label}
                  role="tab"
                  aria-selected={activeTab === index}
                  onClick={() => setActiveTab(index)}
                  variant={activeTab === index ? "contained" : "outlined"}
                  color={activeTab === index ? "primary" : "inherit"}
                  size="small"
                  startIcon={item.icon}
                  sx={{
                    flex: "1 1 auto",
                    minWidth: 104,
                    minHeight: 40,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          ) : (
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabItems.map((item) => (
                  <Tab
                    key={item.label}
                    icon={item.icon}
                    iconPosition="start"
                    label={item.label}
                  />
                ))}
              </Tabs>
            </Box>
          )}

          <TabPanel value={activeTab} index={0}>
            <AiThemeStudioPanel
              currentTheme={theme}
              onThemeGenerated={(newTheme) => updateThemeState(() => newTheme)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <PresetSelector
              currentPreset={theme.preset}
              onSelect={handlePresetSelect}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ColorPaletteEditor
              colors={
                theme.tokens?.colors || DEFAULT_TENANT_THEME.tokens.colors
              }
              onChange={handleColorsChange}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: asDrawer ? 12 : 6 }}>
                <GlassmorphismPanel
                  config={
                    theme.effects?.glassmorphism ||
                    DEFAULT_TENANT_THEME.effects.glassmorphism
                  }
                  onChange={handleGlassmorphismChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: asDrawer ? 12 : 6 }}>
                <NeumorphismPanel
                  config={
                    theme.effects?.neumorphism ||
                    DEFAULT_TENANT_THEME.effects.neumorphism
                  }
                  onChange={handleNeumorphismChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <ComponentStyleSelector
              components={theme.components || DEFAULT_TENANT_THEME.components}
              globalEffectType={theme.effects?.globalType || "none"}
              onChange={handleComponentsChange}
              onGlobalChange={handleGlobalEffectChange}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <SpacingEditor
              spacing={
                theme.tokens?.spacing || DEFAULT_TENANT_THEME.tokens.spacing
              }
              borderRadius={
                theme.tokens?.borderRadius ||
                DEFAULT_TENANT_THEME.tokens.borderRadius
              }
              onSpacingChange={handleSpacingChange}
              onBorderRadiusChange={handleBorderRadiusChange}
            />
          </TabPanel>
        </Grid>

        {!asDrawer && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: "sticky", top: 16 }}>
              <LivePreview theme={theme} />
            </Box>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );

  if (asDrawer) {
    return (
      // `persistent`, not the default `temporary`: a temporary Drawer is a
      // Modal, and its backdrop dims the very UI this panel exists to
      // restyle - you cannot judge a theme through a grey wash. Persistent
      // drops the Modal entirely (no backdrop, no focus trap, no scroll
      // lock), so the app behind stays legible and usable while colors,
      // effects and radii land on it live. The paper is still
      // position: fixed and the docked root is zero-width, so nothing in
      // the page shifts when it opens.
      <Drawer
        anchor="right"
        variant="persistent"
        open={isOpen}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 560 },
            p: 1,
            // Opaque surface + elevation, since there is no longer a
            // backdrop separating this panel from the live page behind it.
            bgcolor: "background.paper",
            boxShadow: 8,
          },
        }}
      >
        {/* Without a Modal wrapper the children would otherwise stay mounted
            (and keep fetching the tenant theme) while parked off-canvas. */}
        {isOpen ? content : null}
      </Drawer>
    );
  }

  return content;
};

export default ThemeEditor;
