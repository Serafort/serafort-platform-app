import React, { useState } from 'react'
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material'
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Palette as PaletteIcon,
  ViewQuilt as ViewQuiltIcon,
  Widgets as WidgetsIcon,
  Tune as TuneIcon,
  Analytics,
  ShoppingCart,
  WbSunny,
  ViewArray,
  Tab as TabIcon,
  CheckCircle,
  DashboardCustomize,
  DragIndicator as DragIndicatorIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { globalWidgetRegistry } from '@cap/platform-core'
import { useAppStore } from '@cap/platform-store'
import { useShallow } from 'zustand/shallow'
import { widgetMarketplaceStore, useWidgetMarketplaceStore } from '../../store/widgetMarketplaceStore'
import { themeEditorStore } from '../../store/themeEditorStore'
import { aiWidgetGeneratorService } from '../../services/aiWidgetGeneratorService'
import type { TenantThemeConfig } from '../../types'

export interface WidgetCatalogItem {
  id: string
  title: string
  description: string
  category: 'analytics' | 'commerce' | 'containers' | 'tools'
  defaultSpan: number
  defaultHeight: number
  icon: React.ReactNode
  isContainer?: boolean
}

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: 'dashboard-widget-revenueChart',
    title: 'Revenue Analytics',
    description: 'Real-time revenue metrics, trends, and interactive chart visualization.',
    category: 'analytics',
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <Analytics color="primary" />,
  },
  {
    id: 'dashboard-widget-recentOrders',
    title: 'Recent Orders Table',
    description: 'Live order stream with customer details, status badges, and transaction values.',
    category: 'commerce',
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <ShoppingCart color="secondary" />,
  },
  {
    id: 'dashboard-widget-weather',
    title: 'Weather & Conditions',
    description: 'Localized weather forecast, atmospheric conditions, and temperature overview.',
    category: 'tools',
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <WbSunny color="warning" />,
  },
  {
    id: 'dashboard-widget-splitPane',
    title: 'Split Pane Canvas Container',
    description: 'Dual-panel side-by-side or stacked layout canvas container for nested widgets.',
    category: 'containers',
    defaultSpan: 12,
    defaultHeight: 340,
    icon: <ViewArray color="info" />,
    isContainer: true,
  },
  {
    id: 'dashboard-widget-tabbedCanvas',
    title: 'Multi-Tab Canvas Container',
    description: 'Tabbed layout canvas supporting multiple tab views (Analytics, Orders, etc.).',
    category: 'containers',
    defaultSpan: 12,
    defaultHeight: 340,
    icon: <TabIcon color="success" />,
    isContainer: true,
  },
]

/**
 * Render interactive live mini previews for catalog widgets
 */
const renderWidgetLivePreview = (widgetId: string) => {
  switch (widgetId) {
    case 'dashboard-widget-revenueChart':
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(250,250,250,1)'),
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Total Revenue Stream
            </Typography>
            <Chip label="+14.2%" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
          </Box>
          <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>
            $128,450
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 36, mt: 1.25 }}>
            {[40, 65, 45, 80, 95, 75, 100].map((h, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: `${h}%`,
                  bgcolor: i === 6 ? 'primary.main' : 'primary.light',
                  borderRadius: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              />
            ))}
          </Box>
        </Box>
      )

    case 'dashboard-widget-recentOrders':
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(250,250,250,1)'),
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75}>
            Live Transaction Stream
          </Typography>
          <Stack spacing={0.75}>
            {[
              { id: '#ORD-9402', user: 'Alex M.', status: 'Paid', color: 'success', val: '$240' },
              { id: '#ORD-9401', user: 'Sarah K.', status: 'Pending', color: 'warning', val: '$110' },
            ].map((ord) => (
              <Box
                key={ord.id}
                sx={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  p: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {ord.id} • {ord.user}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" fontWeight={700}>
                    {ord.val}
                  </Typography>
                  <Chip label={ord.status} color={ord.color as any} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )

    case 'dashboard-widget-weather':
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(250,250,250,1)'),
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              San Francisco, CA
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              72°F
            </Typography>
            <Typography variant="caption" color="warning.main" fontWeight={600}>
              Sunny • H: 76° L: 58°
            </Typography>
          </Box>
          <WbSunny sx={{ fontSize: 36, color: 'warning.main' }} />
        </Box>
      )

    case 'dashboard-widget-splitPane':
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(250,250,250,1)'),
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'info.main',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="info.main" display="block" mb={0.75}>
            Split Canvas Wireframe
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, height: 48 }}>
            <Box
              sx={{
                flex: 1,
                bgcolor: 'action.hover',
                borderRadius: 1.5,
                p: 1,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Left Panel Slot
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                bgcolor: 'action.hover',
                borderRadius: 1.5,
                p: 1,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Right Panel Slot
              </Typography>
            </Box>
          </Box>
        </Box>
      )

    case 'dashboard-widget-tabbedCanvas':
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(250,250,250,1)'),
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'success.main',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
            <Chip label="Analytics Tab" color="success" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
            <Chip label="Orders Tab" variant="outlined" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
          </Box>
          <Box
            sx={{
              height: 36,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              border: '1px dashed',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Active Tab Content Pane
            </Typography>
          </Box>
        </Box>
      )

    default:
      return (
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            System Module Live Widget
          </Typography>
        </Box>
      )
  }
}

/**
 * Draggable Catalog Item Card with Live Preview
 */
const DraggableCatalogCard: React.FC<{
  item: WidgetCatalogItem
  onAdd: (id: string, title: string) => void
}> = ({ item, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `catalog-${item.id}`,
    data: {
      layoutId: 'marketplace-catalog',
      slotId: `catalog-${item.id}`,
      widgetId: item.id,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 9999,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      draggable
      {...attributes}
      {...listeners}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            widgetId: item.id,
            layoutId: 'marketplace-catalog',
            slotId: `catalog-${item.id}`,
          })
        )
        e.dataTransfer.effectAllowed = 'copy'
      }}
      sx={{
        borderRadius: 3,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
        opacity: isDragging ? 0.6 : 1,
        borderColor: isDragging ? 'primary.main' : 'divider',
        boxShadow: isDragging ? 8 : 0,
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* Drag Handle Icon */}
            <Tooltip title="Drag anywhere on card to drop onto canvas slot">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  borderRadius: 1,
                  color: 'primary.main',
                }}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
            </Tooltip>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                display: 'flex',
              }}
            >
              {item.icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {item.title}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" mt={0.25}>
                <Chip label={item.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                {item.isContainer && (
                  <Chip label="Container Canvas" color="info" size="small" sx={{ height: 20, fontSize: '0.675rem' }} />
                )}
              </Stack>
            </Box>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onAdd(item.id, item.title)
            }}
            sx={{ borderRadius: 2 }}
          >
            Add
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1.5 }}>
          {item.description}
        </Typography>

        {/* Live Mini Preview */}
        <Box sx={{ mt: 1 }}>{renderWidgetLivePreview(item.id)}</Box>
      </CardContent>
    </Card>
  )
}

export const WidgetMarketplaceDrawer: React.FC = () => {
  const { isOpen, activePageId, searchQuery, selectedCategory, activeTab } = useWidgetMarketplaceStore()
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Read available layouts and actions from Zustand app store
  const layoutKeys = useAppStore(
    useShallow((state) => Object.keys(state.layouts || {}))
  )
  const transferWidget = useAppStore((state) => state.transferWidget)
  const addPanel = useAppStore((state) => state.addPanel)

  const availableCanvasKeys = React.useMemo(
    () => Array.from(new Set(['dashboard', ...layoutKeys])),
    [layoutKeys]
  )

  const handleClose = () => {
    widgetMarketplaceStore.closeMarketplace()
  }

  const handleAddWidget = (widgetId: string, widgetTitle: string) => {
    const targetPageId = activePageId || 'dashboard'
    // Call transferWidget using a dynamic virtual source slot to place widgetId into targetPageId
    transferWidget('marketplace-catalog', `catalog-${widgetId}`, targetPageId, `${targetPageId}-slot-1`)
    setSnackbar({
      open: true,
      message: `Added "${widgetTitle}" to ${targetPageId}`,
      severity: 'success',
    })
  }

  const handleOpenThemeCustomizer = () => {
    handleClose()
    themeEditorStore.startEditing({} as TenantThemeConfig)
  }

  const [aiPrompt, setAiPrompt] = useState('')
  const [customCatalogItems, setCustomCatalogItems] = useState<WidgetCatalogItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAiWidget = (promptText?: string) => {
    const textToUse = promptText || aiPrompt
    if (!textToUse.trim()) return
    setIsGenerating(true)

    setTimeout(() => {
      const { catalogItem } = aiWidgetGeneratorService.generateWidget(textToUse)
      setCustomCatalogItems((prev) => [catalogItem, ...prev])
      setIsGenerating(false)
      setAiPrompt('')
      setSnackbar({
        open: true,
        message: `✨ AI Generated & Registered Widget: "${catalogItem.title}"`,
        severity: 'success',
      })
    }, 400)
  }

  // Combine default catalog with AI-generated custom catalog items
  const fullCatalog = [...customCatalogItems, ...WIDGET_CATALOG]

  // Filter catalog items by search and category
  const filteredCatalog = fullCatalog.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const registeredWidgets = globalWidgetRegistry.getAll()

  return (
    <>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        hideBackdrop={true}
        ModalProps={{
          keepMounted: true,
          sx: {
            pointerEvents: 'none',
          },
        }}
        PaperProps={{
          sx: {
            pointerEvents: 'auto',
            width: { xs: '100%', sm: 540 },
            p: 0,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(18, 24, 38, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2.5, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardCustomize color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Widget & Canvas Marketplace
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClose} aria-label="close drawer">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Active Target Canvas Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="target-canvas-select-label">Target Canvas</InputLabel>
              <Select
                labelId="target-canvas-select-label"
                value={availableCanvasKeys.includes(activePageId) ? activePageId : 'dashboard'}
                label="Target Canvas"
                onChange={(e) => widgetMarketplaceStore.setActivePageId(e.target.value)}
              >
                {availableCanvasKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key === 'dashboard' ? 'Main Dashboard Canvas' : key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Open Theme Customizer">
              <IconButton
                color="primary"
                onClick={handleOpenThemeCustomizer}
                sx={{
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <PaletteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => widgetMarketplaceStore.setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<WidgetsIcon fontSize="small" />} label="Widgets" iconPosition="start" />
            <Tab icon={<ViewQuiltIcon fontSize="small" />} label="Layout Presets" iconPosition="start" />
            <Tab icon={<TuneIcon fontSize="small" />} label="Inspector" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 0: Widgets Catalog */}
        {activeTab === 0 && (
          <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
            {/* GenAI On-the-Fly Prompt Banner */}
            <Card
              variant="outlined"
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 3,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.05)' : 'rgba(25, 118, 210, 0.03)'),
                borderColor: 'primary.main',
                boxShadow: (theme) => `0 0 12px ${theme.palette.primary.main}22`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                  GenAI Widget Generator
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1.5 }}>
                Describe any widget prompt to dynamically synthesize and register a custom widget on the fly.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 'Server CPU & Memory Gauges' or 'MRR Q3 Chart'..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateAiWidget()
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleGenerateAiWidget()}
                  disabled={isGenerating || !aiPrompt.trim()}
                  startIcon={<AutoAwesomeIcon fontSize="small" />}
                  sx={{ borderRadius: 2, whiteSpace: 'nowrap', px: 2 }}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ overflowX: 'auto' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Prompts:
                </Typography>
                <Chip
                  label="🚀 MRR Chart"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() => handleGenerateAiWidget('MRR & Revenue Sales Chart')}
                />
                <Chip
                  label="⚡ CPU & Memory"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() => handleGenerateAiWidget('Server CPU & Memory Gauges')}
                />
                <Chip
                  label="📊 User Growth"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() => handleGenerateAiWidget('User Active Growth Metrics')}
                />
              </Stack>
            </Card>

            {/* Search & Filter bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search widgets, titles, tags..."
                value={searchQuery}
                onChange={(e) => widgetMarketplaceStore.setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />
              <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', pb: 0.5 }}>
                {['all', 'analytics', 'commerce', 'containers', 'tools'].map((cat) => (
                  <Chip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    size="small"
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                    onClick={() => widgetMarketplaceStore.setSelectedCategory(cat)}
                    clickable
                  />
                ))}
              </Stack>
            </Box>

            {/* Catalog Grid with Live Previews and Drag & Drop */}
            <Stack spacing={2}>
              {filteredCatalog.map((item) => (
                <DraggableCatalogCard key={item.id} item={item} onAdd={handleAddWidget} />
              ))}

              {/* Registered system modules info */}
              {registeredWidgets.length > 0 && (
                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    Registered System Widgets ({registeredWidgets.length})
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    {registeredWidgets.map((desc) => (
                      <Box
                        key={desc.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {desc.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {desc.titleKey}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAddWidget(desc.id, desc.id)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Tab 1: Layout Presets */}
        {activeTab === 1 && (
          <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Choose a pre-packaged canvas grid layout for target canvas: <strong>{activePageId}</strong>
            </Typography>

            <Stack spacing={2}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    Dual-Pane Split Canvas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8125rem' }}>
                    Horizontal split layout containing left & right widget canvases.
                  </Typography>

                  {/* Wireframe Preview */}
                  <Box sx={{ mb: 2 }}>{renderWidgetLivePreview('dashboard-widget-splitPane')}</Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewQuiltIcon />}
                    onClick={() => handleAddWidget('dashboard-widget-splitPane', 'Split Pane Canvas')}
                  >
                    Insert Split Canvas
                  </Button>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    Multi-Tab Canvas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8125rem' }}>
                    Tabbed layout switching between Analytics and Order canvases.
                  </Typography>

                  {/* Wireframe Preview */}
                  <Box sx={{ mb: 2 }}>{renderWidgetLivePreview('dashboard-widget-tabbedCanvas')}</Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TabIcon />}
                    onClick={() => handleAddWidget('dashboard-widget-tabbedCanvas', 'Multi-Tab Canvas')}
                  >
                    Insert Tabbed Canvas
                  </Button>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    3-Column Bento Grid
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8125rem' }}>
                    Standard dashboard layout featuring Revenue, Orders, and Weather side-by-side.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleAddWidget('dashboard-widget-revenueChart', 'Revenue Analytics')
                      handleAddWidget('dashboard-widget-recentOrders', 'Recent Orders')
                      handleAddWidget('dashboard-widget-weather', 'Weather')
                    }}
                  >
                    Load Bento Grid
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        )}

        {/* Tab 2: Canvas Inspector */}
        {activeTab === 2 && (
          <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Active Canvas: {activePageId}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Manage slots, layout sizes, and add empty panel slots.
            </Typography>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  addPanel(activePageId)
                  setSnackbar({ open: true, message: `Added new panel slot to ${activePageId}`, severity: 'info' })
                }}
              >
                Add Empty Panel Slot
              </Button>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                  Theme Customizer Quick-Link
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8125rem' }}>
                  Modify colors, glassmorphism, neumorphism, fonts, and presets in real time.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaletteIcon />}
                  onClick={handleOpenThemeCustomizer}
                >
                  Open Theme Builder
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default WidgetMarketplaceDrawer
