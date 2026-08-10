import React, { useState, useCallback } from 'react';
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
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import { ColorPaletteEditor } from '../components/ColorPaletteEditor';
import { GlassmorphismPanel } from '../components/EffectControls/GlassmorphismPanel';
import { NeumorphismPanel } from '../components/EffectControls/NeumorphismPanel';
import { ComponentStyleSelector } from '../components/ComponentStyleSelector';
import { SpacingEditor } from '../components/SpacingEditor';
import { PresetSelector } from '../components/PresetSelector';
import { LivePreview } from '../components/LivePreview';
import type {
  TenantThemeConfig,
  ColorToken,
  GlassmorphismConfig,
  NeumorphismConfig,
  ComponentStyles,
  EffectType,
} from '@cap/theme';
import { DEFAULT_TENANT_THEME, applyPreset, useThemeEditorStore, themeEditorStore } from '@cap/theme';
import type { ThemePresetId } from '@cap/theme';

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
  organizationId = 'default',
  onSave,
  asDrawer = false,
  open: customOpen,
  onClose,
}) => {
  const { isEditing, draftConfig } = useThemeEditorStore();

  const theme = draftConfig || initialTheme || DEFAULT_TENANT_THEME;

  const updateThemeState = useCallback((updater: (prev: TenantThemeConfig) => TenantThemeConfig) => {
    if (!draftConfig) {
      themeEditorStore.startEditing(theme);
    }
    themeEditorStore.setDraftConfig((prev) => updater(prev || theme));
  }, [draftConfig, theme]);

  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleColorsChange = useCallback((colors: Record<string, ColorToken>) => {
    updateThemeState((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        colors: {
          ...prev.tokens.colors,
          ...colors,
        } as TenantThemeConfig['tokens']['colors'],
      },
    }));
  }, [updateThemeState]);

  const handleGlassmorphismChange = useCallback((glassmorphism: GlassmorphismConfig) => {
    updateThemeState((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        glassmorphism,
        globalType: glassmorphism.enabled ? 'glass' : prev.effects.globalType,
      },
    }));
  }, [updateThemeState]);

  const handleNeumorphismChange = useCallback((neumorphism: NeumorphismConfig) => {
    updateThemeState((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        neumorphism,
        globalType: neumorphism.enabled ? 'neu' : prev.effects.globalType,
      },
    }));
  }, [updateThemeState]);

  const handleComponentsChange = useCallback((components: ComponentStyles) => {
    updateThemeState((prev) => ({
      ...prev,
      components,
    }));
  }, [updateThemeState]);

  const handleGlobalEffectChange = useCallback((globalType: EffectType) => {
    updateThemeState((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        globalType,
      },
    }));
  }, [updateThemeState]);

  const handleSpacingChange = useCallback((spacing: Record<string, string>) => {
    updateThemeState((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        spacing,
      },
    }));
  }, [updateThemeState]);

  const handleBorderRadiusChange = useCallback((borderRadius: Record<string, string>) => {
    updateThemeState((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        borderRadius,
      },
    }));
  }, [updateThemeState]);

  const handlePresetSelect = useCallback((presetId: ThemePresetId) => {
    const presetTheme = applyPreset(presetId);
    updateThemeState(() => ({
      ...presetTheme,
      organizationId,
    }));
  }, [organizationId, updateThemeState]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(theme);
      }
      themeEditorStore.discardDraft();
      setSnackbar({
        open: true,
        message: 'Theme saved successfully!',
        severity: 'success',
      });
      if (onClose) onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save theme. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    updateThemeState(() => ({ ...DEFAULT_TENANT_THEME, organizationId }));
    setSnackbar({
      open: true,
      message: 'Theme reset to default.',
      severity: 'info',
    });
  };

  const handleDiscard = () => {
    themeEditorStore.discardDraft();
    if (onClose) onClose();
  };


  const isOpen = customOpen !== undefined ? customOpen : isEditing;

  const content = (
    <Container maxWidth={asDrawer ? false : 'xl'} sx={{ py: 3, px: asDrawer ? 2 : undefined, width: asDrawer ? 500 : undefined, maxWidth: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Theme Customization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time multi-tenant theme builder
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {asDrawer && (
            <IconButton onClick={handleDiscard} size="small" aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: asDrawer ? 12 : 8 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Presets" />
              <Tab label="Colors" />
              <Tab label="Effects" />
              <Tab label="Components" />
              <Tab label="Spacing" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <PresetSelector
              currentPreset={theme.preset}
              onSelect={handlePresetSelect}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ColorPaletteEditor
              colors={theme.tokens.colors}
              onChange={handleColorsChange}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: asDrawer ? 12 : 6 }}>
                <GlassmorphismPanel
                  config={theme.effects.glassmorphism}
                  onChange={handleGlassmorphismChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: asDrawer ? 12 : 6 }}>
                <NeumorphismPanel
                  config={theme.effects.neumorphism}
                  onChange={handleNeumorphismChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <ComponentStyleSelector
              components={theme.components}
              globalEffectType={theme.effects.globalType}
              onChange={handleComponentsChange}
              onGlobalChange={handleGlobalEffectChange}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <SpacingEditor
              spacing={theme.tokens.spacing}
              borderRadius={theme.tokens.borderRadius}
              onSpacingChange={handleSpacingChange}
              onBorderRadiusChange={handleBorderRadiusChange}
            />
          </TabPanel>
        </Grid>

        {!asDrawer && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 16 }}>
              <LivePreview theme={theme} />
            </Box>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleDiscard}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520 },
            p: 1,
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return content;
};

export default ThemeEditor;

