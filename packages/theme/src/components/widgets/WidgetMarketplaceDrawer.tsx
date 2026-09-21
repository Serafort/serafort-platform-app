import React, { useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  Tooltip,
  Stack,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PaletteIcon from "@mui/icons-material/Palette";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import WidgetsIcon from "@mui/icons-material/Widgets";
import TuneIcon from "@mui/icons-material/Tune";
import Analytics from "@mui/icons-material/Analytics";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import WbSunny from "@mui/icons-material/WbSunny";
import ViewArray from "@mui/icons-material/ViewArray";
import TabIcon from "@mui/icons-material/Tab";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { globalWidgetRegistry } from "../../registry/WidgetRegistry";
import { useAppStore } from "@cap/platform-store";
import { useShallow } from "zustand/shallow";
import {
  widgetMarketplaceStore,
  useWidgetMarketplaceStore,
} from "../../store/widgetMarketplaceStore";
import { themeEditorStore } from "../../store/themeEditorStore";
import { aiWidgetGeneratorService } from "../../services/aiWidgetGeneratorService";
import { effectSurfaceBackground } from "../../utils/effectSurfaceCss";
import {
  CONTROL_HEIGHT,
  RADIUS,
  accentStrip,
  hairline,
  iconTile,
  panelCard,
  panelCardInteractive,
  primaryAction,
  sectionLabel,
  suggestionPill,
} from "../../styles/panelStyles";
import type { TenantThemeConfig } from "../../types";

export interface WidgetCatalogItem {
  id: string;
  title: string;
  description: string;
  category: "analytics" | "commerce" | "containers" | "tools";
  defaultSpan: number;
  defaultHeight: number;
  icon: React.ReactNode;
  isContainer?: boolean;
}

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: "dashboard-widget-revenueChart",
    title: "Revenue Analytics",
    description:
      "Real-time revenue metrics, trends, and interactive chart visualization.",
    category: "analytics",
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <Analytics color="primary" />,
  },
  {
    id: "dashboard-widget-recentOrders",
    title: "Recent Orders Table",
    description:
      "Live order stream with customer details, status badges, and transaction values.",
    category: "commerce",
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <ShoppingCart color="secondary" />,
  },
  {
    id: "dashboard-widget-weather",
    title: "Weather & Conditions",
    description:
      "Localized weather forecast, atmospheric conditions, and temperature overview.",
    category: "tools",
    defaultSpan: 4,
    defaultHeight: 280,
    icon: <WbSunny color="warning" />,
  },
  {
    id: "dashboard-widget-splitPane",
    title: "Split Pane Canvas Container",
    description:
      "Dual-panel side-by-side or stacked layout canvas container for nested widgets.",
    category: "containers",
    defaultSpan: 12,
    defaultHeight: 340,
    icon: <ViewArray color="info" />,
    isContainer: true,
  },
  {
    id: "dashboard-widget-tabbedCanvas",
    title: "Multi-Tab Canvas Container",
    description:
      "Tabbed layout canvas supporting multiple tab views (Analytics, Orders, etc.).",
    category: "containers",
    defaultSpan: 12,
    defaultHeight: 340,
    icon: <TabIcon color="success" />,
    isContainer: true,
  },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "analytics", label: "Analytics" },
  { key: "commerce", label: "Commerce" },
  { key: "containers", label: "Containers" },
  { key: "tools", label: "Tools" },
] as const;

/** What a widget costs on the grid, in the grid's own terms. */
const describeFootprint = (item: WidgetCatalogItem): string =>
  `${item.defaultSpan >= 12 ? "Full width" : `${item.defaultSpan} columns`} · ${
    item.defaultHeight
  }px tall`;

/**
 * A skeleton of a layout's shape. Deliberately abstract: the previews these
 * replace showed invented data - a $128,450 revenue figure, two named
 * customers, a San Francisco forecast - on every card, which is a lot of
 * fiction to scroll past when all you are choosing is a widget.
 */
const LayoutSketch: React.FC<{ kind: "split" | "tabs" | "bento" }> = ({
  kind,
}) => {
  const block = {
    borderRadius: RADIUS.control,
    bgcolor: "action.hover",
    flexGrow: 1,
  } as const;

  return (
    <Box
      sx={(theme) => ({
        height: 96,
        p: 2.5,
        borderRadius: RADIUS.control,
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${hairline(theme)}`,
        display: "flex",
        flexDirection: kind === "tabs" ? "column" : "row",
        gap: 2,
      })}
    >
      {kind === "split" && (
        <>
          <Box sx={block} />
          <Box sx={block} />
        </>
      )}
      {kind === "bento" && (
        <>
          <Box sx={block} />
          <Box sx={block} />
          <Box sx={block} />
        </>
      )}
      {kind === "tabs" && (
        <>
          <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
            <Box
              sx={{
                width: 54,
                height: 12,
                borderRadius: RADIUS.tag,
                bgcolor: "primary.main",
                opacity: 0.55,
              }}
            />
            <Box
              sx={{
                width: 42,
                height: 12,
                borderRadius: RADIUS.tag,
                bgcolor: "action.hover",
              }}
            />
            <Box
              sx={{
                width: 36,
                height: 12,
                borderRadius: RADIUS.tag,
                bgcolor: "action.hover",
              }}
            />
          </Box>
          <Box sx={block} />
        </>
      )}
    </Box>
  );
};

/**
 * One row in the catalog.
 *
 * The whole row is the drag handle (dnd-kit listeners sit on the row), so the
 * grip is a hint that appears on hover rather than a control of its own - the
 * card used to carry a permanent grip, an Add button and a full live preview,
 * three affordances for two actions.
 */
const DraggableCatalogCard: React.FC<{
  item: WidgetCatalogItem;
  onAdd: (id: string, title: string) => void;
}> = ({ item, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `catalog-${item.id}`,
      data: {
        layoutId: "marketplace-catalog",
        slotId: `catalog-${item.id}`,
        widgetId: item.id,
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 9999,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      draggable
      {...attributes}
      {...listeners}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            widgetId: item.id,
            layoutId: "marketplace-catalog",
            slotId: `catalog-${item.id}`,
          }),
        );
        e.dataTransfer.effectAllowed = "copy";
      }}
      sx={(theme) => ({
        ...panelCardInteractive(theme),
        display: "flex",
        alignItems: "center",
        gap: 3,
        p: 3,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.6 : 1,
        ...(isDragging && {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[8],
        }),
        "&:hover .marketplace-grip": { opacity: 1 },
      })}
    >
      <Tooltip title="Drag anywhere on the row onto a canvas slot">
        <Box
          className="marketplace-grip"
          sx={(theme) => ({
            display: "flex",
            ml: -1.5,
            color: "text.disabled",
            opacity: 0,
            transition: theme.transitions.create("opacity", { duration: 150 }),
          })}
        >
          <DragIndicatorIcon sx={{ fontSize: 16 }} />
        </Box>
      </Tooltip>

      <Box
        sx={(theme) => ({
          ...iconTile(theme, 40),
          "& > svg": { fontSize: 20 },
        })}
      >
        {item.icon}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1.75} alignItems="center">
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.title}
          </Typography>
          {item.isContainer && (
            <Box
              sx={(theme) => ({
                flexShrink: 0,
                height: 18,
                px: 1.5,
                borderRadius: RADIUS.tag,
                bgcolor: "action.hover",
                color: theme.palette.text.secondary,
                fontSize: "0.65625rem",
                fontWeight: 600,
                lineHeight: "18px",
              })}
            >
              Container
            </Box>
          )}
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: "0.78125rem",
            lineHeight: 1.45,
            // Two lines, not one: a single truncated line cut most of these
            // descriptions off mid-word, and the row has the height for it.
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {item.description}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.6875rem", opacity: 0.85 }}
        >
          {describeFootprint(item)}
        </Typography>
      </Box>

      <Button
        size="small"
        variant="contained"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onAdd(item.id, item.title);
        }}
        sx={{ ...primaryAction, flexShrink: 0, px: 4 }}
      >
        Add
      </Button>
    </Box>
  );
};

export const WidgetMarketplaceDrawer: React.FC = () => {
  const { isOpen, activePageId, searchQuery, selectedCategory, activeTab } =
    useWidgetMarketplaceStore();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Read available layouts and actions from Zustand app store
  const layoutKeys = useAppStore(
    useShallow((state) => Object.keys(state.layouts || {})),
  );
  const transferWidget = useAppStore((state) => state.transferWidget);
  const addPanel = useAppStore((state) => state.addPanel);

  const availableCanvasKeys = React.useMemo(
    () => Array.from(new Set(["dashboard", ...layoutKeys])),
    [layoutKeys],
  );

  const handleClose = () => {
    widgetMarketplaceStore.closeMarketplace();
  };

  const handleAddWidget = (widgetId: string, widgetTitle: string) => {
    const targetPageId = activePageId || "dashboard";
    // Call transferWidget using a dynamic virtual source slot to place widgetId into targetPageId
    transferWidget(
      "marketplace-catalog",
      `catalog-${widgetId}`,
      targetPageId,
      `${targetPageId}-slot-1`,
    );
    setSnackbar({
      open: true,
      message: `Added "${widgetTitle}" to ${targetPageId}`,
      severity: "success",
    });
  };

  const handleOpenThemeCustomizer = () => {
    handleClose();
    themeEditorStore.startEditing({} as TenantThemeConfig);
  };

  const [aiPrompt, setAiPrompt] = useState("");
  const [customCatalogItems, setCustomCatalogItems] = useState<
    WidgetCatalogItem[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAiWidget = (promptText?: string) => {
    const textToUse = promptText || aiPrompt;
    if (!textToUse.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const { catalogItem } =
        aiWidgetGeneratorService.generateWidget(textToUse);
      setCustomCatalogItems((prev) => [catalogItem, ...prev]);
      setIsGenerating(false);
      setAiPrompt("");
      setSnackbar({
        open: true,
        message: `Template widget created: "${catalogItem.title}"`,
        severity: "success",
      });
    }, 400);
  };

  // Combine default catalog with AI-generated custom catalog items
  const fullCatalog = [...customCatalogItems, ...WIDGET_CATALOG];

  // Filter catalog items by search and category
  const filteredCatalog = fullCatalog.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // The registry list obeys the search box too. It used to ignore it, so a
  // query that matched nothing in the catalogue still left fourteen unrelated
  // rows sitting under "Nothing matches that".
  const registeredWidgets = globalWidgetRegistry
    .getAll()
    .filter(
      (desc) =>
        !searchQuery.trim() ||
        `${desc.id} ${desc.titleKey}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

  const resultLabel =
    filteredCatalog.length === fullCatalog.length
      ? `${fullCatalog.length} widgets`
      : `${filteredCatalog.length} of ${fullCatalog.length} widgets`;

  const activeCanvasValue = availableCanvasKeys.includes(activePageId)
    ? activePageId
    : "dashboard";

  const canvasLabel = (key: string) =>
    key === "dashboard" ? "Main Dashboard Canvas" : key;

  const tabs = [
    { label: "Widgets", icon: <WidgetsIcon sx={{ fontSize: 17 }} />, count: String(fullCatalog.length) },
    { label: "Layouts", icon: <ViewQuiltIcon sx={{ fontSize: 17 }} />, count: "3" },
    { label: "Inspector", icon: <TuneIcon sx={{ fontSize: 17 }} />, count: "" },
  ];

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
            pointerEvents: "none",
          },
        }}
        PaperProps={{
          sx: (theme) => ({
            pointerEvents: "auto",
            width: { xs: "100%", sm: 540 },
            p: 0,
            // Follows the active effect rather than a hard-coded translucent
            // white: this panel used to paint `rgba(255,255,255,0.95)` with a
            // fixed 16px blur in every theme, so a dark tenant or any style
            // preset stopped at its edge.
            ...effectSurfaceBackground(theme.palette.background.paper),
            borderLeft: `1px solid ${hairline(theme)}`,
            boxShadow: theme.shadows[8],
          }),
        }}
      >
        {/* ---- Header ---- */}
        <Box sx={{ px: 5, pt: 5, pb: 4, flexShrink: 0 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}
              >
                Widget marketplace
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8125rem" }}
              >
                Drag a widget onto the canvas, or add it to the destination
                below.
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              aria-label="close drawer"
              sx={{
                width: CONTROL_HEIGHT,
                height: CONTROL_HEIGHT,
                mt: -2.5,
                mr: -2.5,
                borderRadius: RADIUS.control,
                color: "text.secondary",
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Destination. Context, not a form field: it used to be an
              outlined Select with a floating "Target Canvas" label, which
              reads as something you must fill in before you may continue. */}
          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mt: 4 }}>
            <Typography
              sx={{ ...sectionLabel, color: "text.secondary", whiteSpace: "nowrap" }}
            >
              Adding to
            </Typography>
            <FormControl size="small" sx={{ flexGrow: 1, minWidth: 0 }}>
              <Select
                value={activeCanvasValue}
                onChange={(e) =>
                  widgetMarketplaceStore.setActivePageId(e.target.value)
                }
                aria-label="Target canvas"
                sx={(theme) => ({
                  minHeight: CONTROL_HEIGHT,
                  borderRadius: RADIUS.control,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  backgroundColor: theme.palette.background.default,
                  "& .MuiSelect-select": {
                    py: 0,
                    minHeight: CONTROL_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                  },
                })}
              >
                {availableCanvasKeys.map((key) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: "0.875rem" }}>
                    {canvasLabel(key)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Open Theme Customizer">
              <IconButton
                onClick={handleOpenThemeCustomizer}
                aria-label="Open Theme Customizer"
                sx={(theme) => ({
                  width: CONTROL_HEIGHT,
                  height: CONTROL_HEIGHT,
                  flexShrink: 0,
                  border: `1px solid ${hairline(theme)}`,
                  borderRadius: RADIUS.control,
                  color: "primary.main",
                })}
              >
                <PaletteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* ---- Tabs ---- */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => widgetMarketplaceStore.setActiveTab(val)}
          sx={(theme) => ({
            px: 3,
            flexShrink: 0,
            borderBottom: `1px solid ${hairline(theme)}`,
            minHeight: CONTROL_HEIGHT,
            "& .MuiTab-root": {
              minHeight: CONTROL_HEIGHT,
              px: 3,
              gap: 1.75,
              fontSize: "0.84375rem",
              fontWeight: 500,
              textTransform: "none",
              color: "text.secondary",
              "&.Mui-selected": { fontWeight: 600 },
            },
          })}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              icon={tab.icon}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <span>{tab.label}</span>
                  {tab.count && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {tab.count}
                    </Typography>
                  )}
                </Stack>
              }
            />
          ))}
        </Tabs>

        {/* ---- Tab 0: Widgets ---- */}
        {activeTab === 0 && (
          <Box sx={{ p: 5, overflowY: "auto", flex: 1 }}>
            {/* Generator. One quiet strip: it used to be an accent-bordered
                card with a coloured glow, which made the thing you might use
                occasionally the loudest thing above the catalogue. */}
            <Box sx={(theme) => ({ ...accentStrip(theme), p: 3.5, mb: 4.5 })}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2.5 }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  Describe a widget and generate it
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Box
                  component="input"
                  value={aiPrompt}
                  placeholder="Server CPU and memory gauges"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAiPrompt(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") handleGenerateAiWidget();
                  }}
                  sx={(theme) => ({
                    flexGrow: 1,
                    minWidth: 0,
                    height: CONTROL_HEIGHT,
                    px: 3,
                    font: "inherit",
                    fontSize: "0.84375rem",
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: RADIUS.control,
                    outline: "none",
                    "&::placeholder": {
                      color: theme.palette.text.secondary,
                      opacity: 1,
                    },
                    "&:focus": {
                      borderColor: theme.palette.primary.main,
                    },
                  })}
                />
                <Button
                  variant="contained"
                  onClick={() => handleGenerateAiWidget()}
                  disabled={isGenerating || !aiPrompt.trim()}
                  sx={{ ...primaryAction, flexShrink: 0, px: 4 }}
                >
                  {isGenerating ? "Generating…" : "Generate"}
                </Button>
              </Stack>

              {/* Suggestions, without the emoji: the app draws its icons, and
                  a rocket on a chip is not one of them. */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2.5 }}>
                {[
                  { label: "MRR chart", prompt: "MRR & Revenue Sales Chart" },
                  {
                    label: "CPU & memory",
                    prompt: "Server CPU & Memory Gauges",
                  },
                  {
                    label: "User growth",
                    prompt: "User Active Growth Metrics",
                  },
                ].map((suggestion) => (
                  <Box
                    component="button"
                    type="button"
                    key={suggestion.label}
                    onClick={() => handleGenerateAiWidget(suggestion.prompt)}
                    sx={(theme) => ({
                      ...suggestionPill(theme),
                      px: 2.5,
                      font: "inherit",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    })}
                  >
                    {suggestion.label}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Search & filters */}
            <Stack spacing={3} sx={{ mb: 4 }}>
              <Stack
                direction="row"
                spacing={2.5}
                alignItems="center"
                sx={(theme) => ({
                  height: CONTROL_HEIGHT,
                  px: 3,
                  borderRadius: RADIUS.control,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.default,
                })}
              >
                <SearchIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                <Box
                  component="input"
                  value={searchQuery}
                  placeholder="Search widgets"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    widgetMarketplaceStore.setSearchQuery(e.target.value)
                  }
                  sx={(theme) => ({
                    flexGrow: 1,
                    minWidth: 0,
                    border: 0,
                    background: "none",
                    font: "inherit",
                    fontSize: "0.875rem",
                    color: "text.primary",
                    outline: "none",
                    "&::placeholder": {
                      color: theme.palette.text.secondary,
                      opacity: 1,
                    },
                  })}
                />
              </Stack>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <Box
                      component="button"
                      type="button"
                      key={cat.key}
                      aria-pressed={isSelected}
                      onClick={() =>
                        widgetMarketplaceStore.setSelectedCategory(cat.key)
                      }
                      sx={(theme) => ({
                        ...suggestionPill(theme),
                        height: 32,
                        px: 3,
                        font: "inherit",
                        fontSize: "0.78125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        ...(isSelected && {
                          backgroundColor: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                            borderColor: theme.palette.primary.dark,
                            color: theme.palette.primary.contrastText,
                          },
                        }),
                      })}
                    >
                      {cat.label}
                    </Box>
                  );
                })}
              </Box>

              <Typography sx={{ ...sectionLabel, color: "text.secondary" }}>
                {resultLabel}
              </Typography>
            </Stack>

            {/* Catalog */}
            <Stack spacing={2.5}>
              {filteredCatalog.map((item) => (
                <DraggableCatalogCard
                  key={item.id}
                  item={item}
                  onAdd={handleAddWidget}
                />
              ))}

              {filteredCatalog.length === 0 && (
                <Box
                  sx={(theme) => ({
                    px: 4,
                    py: 8,
                    textAlign: "center",
                    borderRadius: RADIUS.card,
                    border: `1px dashed ${theme.palette.divider}`,
                  })}
                >
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Nothing matches that
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.8125rem", mt: 1 }}
                  >
                    Try another word, or describe the widget you want and
                    generate it.
                  </Typography>
                </Box>
              )}

              {/* Registered system modules */}
              {registeredWidgets.length > 0 && (
                <Box sx={{ pt: 3 }}>
                  <Typography
                    sx={{ ...sectionLabel, color: "text.secondary", mb: 2.5 }}
                  >
                    Registered system widgets ({registeredWidgets.length})
                  </Typography>
                  <Stack spacing={2}>
                    {registeredWidgets.map((desc) => (
                      <Box
                        key={desc.id}
                        sx={(theme) => ({
                          ...panelCard(theme),
                          p: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        })}
                      >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                          >
                            {desc.id}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {desc.titleKey}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label={`Add ${desc.id}`}
                          onClick={() => handleAddWidget(desc.id, desc.id)}
                          sx={{
                            width: CONTROL_HEIGHT,
                            height: CONTROL_HEIGHT,
                            flexShrink: 0,
                            borderRadius: RADIUS.control,
                            color: "primary.main",
                          }}
                        >
                          <AddIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* ---- Tab 1: Layout presets ---- */}
        {activeTab === 1 && (
          <Box sx={{ p: 5, overflowY: "auto", flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8125rem", mb: 4 }}
            >
              A layout drops a ready-made arrangement onto{" "}
              <Box component="strong" sx={{ color: "text.primary" }}>
                {canvasLabel(activeCanvasValue)}
              </Box>
              .
            </Typography>

            <Stack spacing={3}>
              {[
                {
                  title: "Dual-pane split canvas",
                  description:
                    "Two canvases side by side, each holding its own widgets.",
                  sketch: "split" as const,
                  onInsert: () =>
                    handleAddWidget(
                      "dashboard-widget-splitPane",
                      "Split Pane Canvas",
                    ),
                },
                {
                  title: "Multi-tab canvas",
                  description:
                    "One frame, several tabbed views of the same space.",
                  sketch: "tabs" as const,
                  onInsert: () =>
                    handleAddWidget(
                      "dashboard-widget-tabbedCanvas",
                      "Multi-Tab Canvas",
                    ),
                },
                {
                  title: "Three-column bento grid",
                  description:
                    "Revenue, orders and weather side by side — the standard dashboard.",
                  sketch: "bento" as const,
                  onInsert: () => {
                    handleAddWidget(
                      "dashboard-widget-revenueChart",
                      "Revenue Analytics",
                    );
                    handleAddWidget(
                      "dashboard-widget-recentOrders",
                      "Recent Orders",
                    );
                    handleAddWidget("dashboard-widget-weather", "Weather");
                  },
                },
              ].map((preset) => (
                <Box
                  key={preset.title}
                  sx={(theme) => ({ ...panelCard(theme), p: 3.5 })}
                >
                  <Stack
                    direction="row"
                    spacing={3}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {preset.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.78125rem" }}
                      >
                        {preset.description}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={preset.onInsert}
                      sx={{ ...primaryAction, flexShrink: 0, px: 4 }}
                    >
                      Insert
                    </Button>
                  </Stack>
                  <LayoutSketch kind={preset.sketch} />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* ---- Tab 2: Canvas inspector ---- */}
        {activeTab === 2 && (
          <Box sx={{ p: 5, overflowY: "auto", flex: 1 }}>
            <Stack spacing={5}>
              <Box>
                <Typography
                  sx={{ ...sectionLabel, color: "text.secondary", mb: 2.5 }}
                >
                  Canvas
                </Typography>
                <Box sx={(theme) => ({ ...panelCard(theme), overflow: "hidden" })}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                    sx={(theme) => ({
                      px: 3.5,
                      py: 2.5,
                      borderBottom: `1px solid ${hairline(theme)}`,
                    })}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      Name
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8125rem", fontWeight: 500 }}
                    >
                      {canvasLabel(activeCanvasValue)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                    sx={{ px: 3.5, py: 2.5 }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      Canvases available
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8125rem", fontWeight: 500 }}
                    >
                      {availableCanvasKeys.length}
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Box>
                <Typography
                  sx={{ ...sectionLabel, color: "text.secondary", mb: 2.5 }}
                >
                  Actions
                </Typography>
                <Stack spacing={2.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      addPanel(activeCanvasValue);
                      setSnackbar({
                        open: true,
                        message: `Added new panel slot to ${activeCanvasValue}`,
                        severity: "info",
                      });
                    }}
                    sx={primaryAction}
                  >
                    Add an empty panel slot
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PaletteIcon />}
                    onClick={handleOpenThemeCustomizer}
                    sx={primaryAction}
                  >
                    Open the theme customizer
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WidgetMarketplaceDrawer;
