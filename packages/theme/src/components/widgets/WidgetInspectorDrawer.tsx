import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import HeightIcon from '@mui/icons-material/Height';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import EditIcon from '@mui/icons-material/Edit';
import { useWidgetInspectorStore, widgetInspectorStore } from '../../store/widgetInspectorStore';
import { useAppStore } from '@cap/platform-store';
import { useShallow } from 'zustand/shallow';
import type { WidgetSpan, WidgetHeight } from '@cap/shared-types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`inspector-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export const WidgetInspectorDrawer: React.FC = () => {
  const { isOpen, inspectingWidget } = useWidgetInspectorStore();
  const t = (key: string, fallback?: string) => fallback || key;

  const [activeTab, setActiveTab] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('glass');
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [autoSync, setAutoSync] = useState(true);

  const layouts = useAppStore((state) => state.layouts || {});
  const actions = useAppStore(
    useShallow((state) => ({
      resizeWidgetSpan: state.resizeWidgetSpan,
      resizeWidgetHeight: state.resizeWidgetHeight,
      transferWidget: state.transferWidget,
      removeWidget: state.removeWidget,
      removePanel: state.removePanel,
    }))
  );

  if (!inspectingWidget) return null;

  const { pageId, slotId, widgetId } = inspectingWidget;
  const layout = layouts[pageId];
  const slotSize = layout?.slotSizes?.[slotId] || { span: 4, height: 280 };

  const handleSpanChange = (_: any, newSpan: number | null) => {
    if (newSpan) {
      actions.resizeWidgetSpan(pageId, slotId, newSpan as WidgetSpan);
    }
  };

  const handleHeightChange = (_: any, newHeight: number | number[]) => {
    actions.resizeWidgetHeight(pageId, slotId, (newHeight as number) as WidgetHeight);
  };

  const handleRemove = () => {
    actions.removeWidget(pageId, slotId);
    widgetInspectorStore.closeInspector();
  };

  const handleRemoveSlot = () => {
    actions.removePanel(pageId, slotId);
    widgetInspectorStore.closeInspector();
  };

  const availablePages = Object.keys(layouts).filter((p) => p !== pageId);

  const handleTransferToPage = (targetPageId: string) => {
    const targetLayout = layouts[targetPageId];
    const targetEmptySlot =
      targetLayout?.slots.find((s: string) => !targetLayout.slotWidgets[s]) ||
      `${targetPageId}-slot-${(targetLayout?.slots.length || 0) + 1}`;

    actions.transferWidget(pageId, slotId, targetPageId, targetEmptySlot);
    widgetInspectorStore.closeInspector();
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => widgetInspectorStore.closeInspector()}
      slotProps={{
        backdrop: {
          sx: { bgcolor: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(3px)' },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 24,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {t('dashboard.inspectorTitle', 'Widget Inspector')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => widgetInspectorStore.closeInspector()}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Widget Overview Card */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: 'action.hover', mt: 1, mb: 1.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
            Inspecting Widget
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.25 }}>
            {customTitle || inspectingWidget.title || widgetId}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={`Canvas: ${pageId}`} size="small" variant="outlined" />
            <Chip label={`Slot: ${slotId}`} size="small" variant="outlined" color="primary" />
          </Stack>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
        >
          <Tab icon={<AspectRatioIcon fontSize="small" />} label="Layout" iconPosition="start" sx={{ minHeight: 44 }} />
          <Tab icon={<PaletteOutlinedIcon fontSize="small" />} label="Style" iconPosition="start" sx={{ minHeight: 44 }} />
          <Tab icon={<SyncIcon fontSize="small" />} label="Data" iconPosition="start" sx={{ minHeight: 44 }} />
          <Tab icon={<DeleteOutlineIcon fontSize="small" />} label="Manage" iconPosition="start" sx={{ minHeight: 44 }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* Tab 0: Layout & Dimensions */}
        <CustomTabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            {/* Custom Title Input */}
            <TextField
              label="Custom Widget Title"
              placeholder={inspectingWidget.title || widgetId}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <EditIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Grid Span / Width */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AspectRatioIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Grid Width (Columns)
                </Typography>
                <Chip label={`${slotSize.span} / 12`} size="small" color="primary" sx={{ ml: 'auto' }} />
              </Box>
              <ToggleButtonGroup
                value={slotSize.span}
                exclusive
                onChange={handleSpanChange}
                size="small"
                fullWidth
              >
                <ToggleButton value={2}>2</ToggleButton>
                <ToggleButton value={3}>3</ToggleButton>
                <ToggleButton value={4}>4</ToggleButton>
                <ToggleButton value={6}>6</ToggleButton>
                <ToggleButton value={8}>8</ToggleButton>
                <ToggleButton value={12}>12</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Height Control */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HeightIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Widget Height
                </Typography>
                <Chip label={`${slotSize.height}px`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
              </Box>
              <Slider
                value={slotSize.height}
                min={180}
                max={600}
                step={20}
                onChange={handleHeightChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}px`}
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button size="small" variant="outlined" onClick={() => actions.resizeWidgetHeight(pageId, slotId, 220 as WidgetHeight)}>
                  Compact (220)
                </Button>
                <Button size="small" variant="outlined" onClick={() => actions.resizeWidgetHeight(pageId, slotId, 320 as WidgetHeight)}>
                  Standard (320)
                </Button>
                <Button size="small" variant="outlined" onClick={() => actions.resizeWidgetHeight(pageId, slotId, 450 as WidgetHeight)}>
                  Tall (450)
                </Button>
              </Stack>
            </Box>

            {/* Transfer Canvas */}
            {availablePages.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <SwapHorizIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Transfer to Canvas
                  </Typography>
                </Box>
                <FormControl fullWidth size="small">
                  <InputLabel id="transfer-canvas-label">Select Target Canvas</InputLabel>
                  <Select
                    labelId="transfer-canvas-label"
                    label="Select Target Canvas"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) handleTransferToPage(e.target.value);
                    }}
                  >
                    {availablePages.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Stack>
        </CustomTabPanel>

        {/* Tab 1: Aesthetics & Styling */}
        <CustomTabPanel value={activeTab} index={1}>
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              Aesthetic Style Presets
            </Typography>
            <ToggleButtonGroup
              value={selectedVariant}
              exclusive
              onChange={(_, val) => val && setSelectedVariant(val)}
              orientation="vertical"
              fullWidth
              size="small"
            >
              <ToggleButton value="glass" sx={{ justifyContent: 'flex-start', px: 2, py: 1.25 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={700}>Glassmorphism</Typography>
                  <Typography variant="caption" color="text.secondary">Frosted glass backdrop with soft border blur</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="elevated" sx={{ justifyContent: 'flex-start', px: 2, py: 1.25 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={700}>Elevated Card</Typography>
                  <Typography variant="caption" color="text.secondary">Classic depth shadow with solid background</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="cyberpunk" sx={{ justifyContent: 'flex-start', px: 2, py: 1.25 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={700}>Neon Cyberpunk</Typography>
                  <Typography variant="caption" color="text.secondary">Vibrant primary accent outline glow</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="minimal" sx={{ justifyContent: 'flex-start', px: 2, py: 1.25 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={700}>Minimal Borderless</Typography>
                  <Typography variant="caption" color="text.secondary">Clean flat aesthetic with subtle divider line</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CustomTabPanel>

        {/* Tab 2: Data & Sync */}
        <CustomTabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Live Data Refresh Rate
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={refreshInterval}
                  min={5}
                  max={60}
                  step={5}
                  onChange={(_, val) => setRefreshInterval(val as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}s`}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Interval: {refreshInterval} seconds between polling ticks
              </Typography>
            </Box>

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Auto Sync with Layout Engine</Typography>
                  <Typography variant="caption" color="text.secondary">Persist configuration state to backend storage automatically</Typography>
                </Box>
              }
            />
          </Stack>
        </CustomTabPanel>

        {/* Tab 3: Manage & Danger Zone */}
        <CustomTabPanel value={activeTab} index={3}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="error.main" fontWeight={700}>
              Danger Zone
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleRemove}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Remove Widget from Slot
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleRemoveSlot}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Delete Entire Panel Slot
            </Button>
          </Stack>
        </CustomTabPanel>
      </Box>
    </Drawer>
  );
};

export default WidgetInspectorDrawer;
