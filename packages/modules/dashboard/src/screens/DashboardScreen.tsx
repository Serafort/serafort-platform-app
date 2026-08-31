import React, { useEffect, useState, useCallback } from "react";
import { Alert, Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { WidgetCanvas, CustomModeFab } from "@cap/theme";
import { useLayoutEngineContext } from "@cap/platform-core";
import { useAppStore } from "@cap/platform-store";
import { useShallow } from "zustand/shallow";
import { DEFAULT_DASHBOARD_GRID_LAYOUT } from "../widgets";
import {
  DndContext,
  DragEndEvent,
  pointerWithin,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { WidgetStudioPanel } from "@cap/module-widget-studio";
import { dashboardService } from "@cap/auth-contracts";

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isCustomMode, toggleCustomMode } = useLayoutEngineContext();
  const { initializeLayout, transferWidget, moveWidget } = useAppStore(
    useShallow((state) => ({
      initializeLayout: state.initializeLayout,
      transferWidget: state.transferWidget,
      moveWidget: state.moveWidget,
    })),
  );
  const PAGE_ID = "dashboard";

  const [activeWidgetInfo, setActiveWidgetInfo] = useState<{
    id: string;
    widgetId?: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSavedLayout() {
      try {
        const response = await dashboardService.getLayout(PAGE_ID);
        if (isMounted && response?.data?.layoutConfig) {
          initializeLayout(PAGE_ID, response.data.layoutConfig);
          return;
        }
      } catch {
        // Use default layout on load error
      }
      if (isMounted) {
        initializeLayout(PAGE_ID, DEFAULT_DASHBOARD_GRID_LAYOUT);
      }
    }

    loadSavedLayout();
    return () => {
      isMounted = false;
    };
  }, [initializeLayout]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    setActiveWidgetInfo({
      id: String(event.active.id),
      widgetId: data?.widgetId,
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveWidgetInfo(null);

      if (!over) {
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData && overData) {
        const fromLayout = activeData.layoutId;
        const fromSlot = activeData.slotId;
        const toLayout = overData.layoutId;
        const toSlot = overData.slotId;

        if (fromLayout === toLayout) {
          if (fromSlot !== toSlot) {
            moveWidget(fromLayout, fromSlot, toSlot);
          }
        } else {
          transferWidget(fromLayout, fromSlot, toLayout, toSlot);
        }

        // Persist updated layout to backend
        try {
          const store = useAppStore.getState();
          const currentLayout = store.layouts?.[PAGE_ID];
          if (currentLayout) {
            await dashboardService.saveLayout(PAGE_ID, {
              layoutConfig: currentLayout,
            });
            setSaveError(null);
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to save dashboard layout";
          setSaveError(message);
        }
      }
    },
    [moveWidget, transferWidget],
  );

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">{t("dashboard.title")}</Typography>
          <Typography variant="body1" color="text.secondary">
            {t("dashboard.subtitle")}
          </Typography>
        </Box>

        {saveError && (
          <Alert
            severity="warning"
            onClose={() => setSaveError(null)}
            sx={{ mb: 3 }}
          >
            {saveError}
          </Alert>
        )}

        {isCustomMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t("dashboard.customModeHint")}
          </Alert>
        )}

        <WidgetCanvas
          pageId={PAGE_ID}
          mode={isCustomMode ? "custom" : "classic"}
          defaultLayout={DEFAULT_DASHBOARD_GRID_LAYOUT}
        />

        <CustomModeFab customMode={isCustomMode} onToggle={toggleCustomMode} />

        {/* AI Widget Studio Panel — right-side drawer */}
        <WidgetStudioPanel />
      </Container>
      <DragOverlay>
        {activeWidgetInfo ? (
          <Box
            sx={{
              p: 1.5,
              px: 2.5,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 6,
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "grabbing",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {activeWidgetInfo.widgetId || "Widget"}
            </Typography>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardScreen;
