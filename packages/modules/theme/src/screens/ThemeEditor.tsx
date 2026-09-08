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
  Stack,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { AiThemeStudioPanel } from "../components/AiThemeStudioPanel";
import { ColorPaletteEditor } from "../components/ColorPaletteEditor";
import { GlassmorphismPanel } from "../components/EffectControls/GlassmorphismPanel";
import { NeumorphismPanel } from "../components/EffectControls/NeumorphismPanel";
import { EffectSettingsPanel } from "../components/EffectControls/EffectSettingsPanel";
import { ComponentStyleSelector } from "../components/ComponentStyleSelector";
import { SpacingEditor } from "../components/SpacingEditor";
import { PresetSelector } from "../components/PresetSelector";
import { ChoiceChip, PanelHeader } from "../components/studioUi";
import { LivePreview } from "../components/LivePreview";
import type {
  TenantThemeConfig,
  ColorToken,
  EffectConfig,
  GlassmorphismConfig,
  NeumorphismConfig,
  ComponentStyles,
  EffectType,
} from "@cap/theme";
import {
  applyThemeVariablesSync,
  DEFAULT_TENANT_THEME,
  EFFECT_CONFIG_KEYS,
  EFFECT_TYPES,
  normalizeEffectConfig,
  THEME_PRESETS,
  getPresetMode,
  mergeThemeWithPreset,
  useThemeEditorStore,
  themeEditorStore,
  savedThemeStore,
  useSavedTheme,
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
  const { data: serverThemeData } = useTenantTheme(organizationId, {
    enabled: !initialTheme, // Only fetch if no initialTheme provided
  });

  const updateMutation = useUpdateTenantTheme(organizationId);

  const { isEditing, draftConfig } = useThemeEditorStore();
  const { settings, updateSettings } = useSettings();

  // Reopening the editor has to show the theme the app is currently wearing.
  // The locally saved theme sits between the server's copy and the defaults:
  // it is what ThemeBridge renders from when the tenant record carries no
  // full theme, which is every time the themes API is unavailable.
  const savedTheme = useSavedTheme();

  const activeInitialTheme =
    initialTheme ||
    serverThemeData?.data?.themeConfig ||
    savedTheme ||
    DEFAULT_TENANT_THEME;
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
      // Every effect sub-config is backfilled from the defaults, not just
      // glassmorphism and neumorphism: a theme saved with a partial brutalism
      // or organic config used to reach the panels with half its fields
      // undefined, and the sliders snapped to zero on first touch.
      effects: EFFECT_CONFIG_KEYS.reduce(
        (merged, key) => ({
          ...merged,
          [key]: {
            ...(DEFAULT_TENANT_THEME.effects as unknown as Record<
              string,
              object
            >)[key],
            ...((rawTheme?.effects as unknown as
              | Record<string, object>
              | undefined)?.[key] || {}),
          },
        }),
        {
          ...DEFAULT_TENANT_THEME.effects,
          ...(rawTheme?.effects || {}),
        } as EffectConfig,
      ),
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

  const activeEffectType: EffectType = theme.effects?.globalType || "standard";

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
        effects: normalizeEffectConfig({
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          glassmorphism,
          // "standard", not "none": "none" is not a member of UIEffect, so
          // turning an effect off used to write a value nothing recognises -
          // no builder matched it and the surfaces kept the last effect's
          // variables until something else reset them.
          globalType: glassmorphism.enabled ? "glass" : "standard",
        }),
      }));
    },
    [updateThemeState],
  );

  const handleNeumorphismChange = useCallback(
    (neumorphism: NeumorphismConfig) => {
      updateThemeState((prev) => ({
        ...prev,
        effects: normalizeEffectConfig({
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          neumorphism,
          globalType: neumorphism.enabled ? "neu" : "standard",
        }),
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
        // normalizeEffectConfig turns on the config the new effect reads and
        // turns the previous one off. Without it, switching effect left the
        // old one's `enabled` flag set, which is the flag the CSS-variable
        // emitter gates on - so the app announced the new effect and kept
        // painting a mix of both.
        effects: normalizeEffectConfig({
          ...DEFAULT_TENANT_THEME.effects,
          ...prev?.effects,
          globalType,
        }),
      }));
    },
    [updateThemeState],
  );

  const handleEffectsChange = useCallback(
    (effects: EffectConfig) => {
      updateThemeState((prev) => ({
        ...prev,
        effects: normalizeEffectConfig({ ...prev?.effects, ...effects }),
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

  const handleShadowsChange = useCallback(
    (shadows: Record<string, string>) => {
      updateThemeState((prev) => ({
        ...prev,
        tokens: {
          ...DEFAULT_TENANT_THEME.tokens,
          ...prev?.tokens,
          shadows,
        },
      }));
    },
    [updateThemeState],
  );

  const handleFluidSpacingChange = useCallback(
    (fluidSpacing: Record<string, string>) => {
      updateThemeState((prev) => ({
        ...prev,
        tokens: {
          ...DEFAULT_TENANT_THEME.tokens,
          ...prev?.tokens,
          fluidSpacing,
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

  // The editor never blocks on the themes API. It used to return a bare
  // spinner while that query was in flight, and with the API unreachable that
  // covered its whole retry budget - the panel was a spinner for the entire
  // time, which is exactly when saving locally matters most. There is always
  // something to edit (server theme, then the locally saved one, then the
  // defaults), and the moment the user touches a control a draft exists and
  // takes precedence over anything that lands late.

  const handleSave = async () => {
    setIsSaving(true);

    // Stamp the mode the theme was authored in, so a saved theme describes
    // itself rather than depending on whatever mode the app happens to be in
    // when it is next read.
    const themeToSave: TenantThemeConfig = {
      ...theme,
      organizationId: theme.organizationId || organizationId,
      metadata: {
        ...theme.metadata,
        mode: settings.mode === "dark" ? "dark" : "light",
        updatedAt: new Date().toISOString(),
      },
    };

    // Persist locally *before* talking to the server, and unconditionally.
    // Saving used to be the server call alone: on failure the optimistic
    // update rolled the CSS variables back, and on success the draft was
    // discarded and the app fell back to `DEFAULT_THEME_CONFIG`, because the
    // tenant record carries branding fields but never a full theme. Either
    // way, pressing Save threw the theme away. The local record is what the
    // app renders from - see savedThemeStore and ThemeBridge - so it has to
    // land whether or not the backend is reachable.
    const persisted = savedThemeStore.save(themeToSave);

    let serverError: unknown = null;
    try {
      if (onSave) {
        await onSave(themeToSave);
      } else {
        await updateMutation.mutateAsync({
          themeConfig: themeToSave,
          isDark: themeToSave.metadata?.mode === "dark",
        });
      }
    } catch (error) {
      serverError = error;
    }

    // The failed mutation reverts the CSS variables to its snapshot, so
    // re-assert the theme that was actually saved.
    if (serverError) applyThemeVariablesSync(themeToSave);

    themeEditorStore.discardDraft();
    setIsSaving(false);

    if (!persisted) {
      setSnackbar({
        open: true,
        message:
          "Theme applied, but it could not be stored on this device. It will be lost on reload.",
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: serverError
          ? "Theme saved on this device. It could not reach the server, so other devices still see the previous theme."
          : "Theme saved successfully!",
        severity: serverError ? "info" : "success",
      });
    }

    if (onClose) onClose();
  };

  const handleReset = () => {
    // Drop the saved record too, otherwise closing the editor without saving
    // would restore the theme the user just asked to be rid of.
    savedThemeStore.clear();
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
            {/*
              The global effect and its settings belong together. This tab used
              to show the Glassmorphism and Neumorphism panels side by side and
              nothing else, which meant the other six effects had no controls at
              all, and that turning glass "on" here was a different act from
              selecting it as the global effect over in Components - two
              switches for one decision, and the app followed whichever was
              touched last. Choosing an effect here is the single decision, and
              the panel below configures whatever was chosen.
            */}
            <Box sx={{ mb: 6 }}>
              <PanelHeader
                title="Surface effect"
                description="How every panel in the app is drawn: its fill, edge, blur and shadow."
              />
              <Stack
                direction="row"
                useFlexGap
                spacing={1.5}
                sx={{ flexWrap: "wrap" }}
              >
                {EFFECT_TYPES.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    selected={activeEffectType === option.value}
                    onClick={() => handleGlobalEffectChange(option.value)}
                  />
                ))}
              </Stack>
            </Box>

            {activeEffectType === "glass" && (
              <GlassmorphismPanel
                config={
                  theme.effects?.glassmorphism ||
                  DEFAULT_TENANT_THEME.effects.glassmorphism
                }
                onChange={handleGlassmorphismChange}
              />
            )}
            {activeEffectType === "neu" && (
              <NeumorphismPanel
                config={
                  theme.effects?.neumorphism ||
                  DEFAULT_TENANT_THEME.effects.neumorphism
                }
                onChange={handleNeumorphismChange}
              />
            )}
            {activeEffectType !== "glass" && activeEffectType !== "neu" && (
              <EffectSettingsPanel
                effectType={activeEffectType}
                effects={theme.effects || DEFAULT_TENANT_THEME.effects}
                onChange={handleEffectsChange}
              />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <ComponentStyleSelector
              components={theme.components || DEFAULT_TENANT_THEME.components}
              globalEffectType={activeEffectType}
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
              shadows={
                theme.tokens?.shadows || DEFAULT_TENANT_THEME.tokens.shadows
              }
              fluidSpacing={
                theme.tokens?.fluidSpacing ||
                DEFAULT_TENANT_THEME.tokens.fluidSpacing
              }
              onSpacingChange={handleSpacingChange}
              onBorderRadiusChange={handleBorderRadiusChange}
              onShadowsChange={handleShadowsChange}
              onFluidSpacingChange={handleFluidSpacingChange}
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

    </Container>
  );

  // Deliberately outside `content`. In drawer mode the panel unmounts its
  // children the moment it closes, and Save closes it - so the confirmation
  // was mounted and unmounted in the same tick and no one ever saw whether
  // their theme had been saved, or why it hadn't.
  const feedback = (
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
  );

  if (asDrawer) {
    return (
      <>
        {/*
          `persistent`, not the default `temporary`: a temporary Drawer is a
          Modal, and its backdrop dims the very UI this panel exists to
          restyle - you cannot judge a theme through a grey wash. Persistent
          drops the Modal entirely (no backdrop, no focus trap, no scroll
          lock), so the app behind stays legible and usable while colors,
          effects and radii land on it live. The paper is still
          position: fixed and the docked root is zero-width, so nothing in
          the page shifts when it opens.
        */}
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
        {feedback}
      </>
    );
  }

  return (
    <>
      {content}
      {feedback}
    </>
  );
};

export default ThemeEditor;
