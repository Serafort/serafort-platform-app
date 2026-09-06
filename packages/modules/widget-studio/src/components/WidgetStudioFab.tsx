import React from "react";
import { Fab, Tooltip } from "@mui/material";
import AutoFixHighRounded from "@mui/icons-material/AutoFixHighRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useWidgetStudio } from "@cap/platform-store";
import { hoverElevation } from "../theme/studioStyles";

interface WidgetStudioFabProps {
  /** Vertical offset from the bottom (default: 80) — stacks above CustomModeFab */
  bottomOffset?: number;
}

/**
 * Floating Action Button that opens the AI Widget Studio panel.
 * Placed on the Dashboard screen alongside CustomModeFab.
 *
 * Flat primary, not a primary→secondary gradient with a coloured glow: the
 * gradient ignored the tenant palette, and a button that grows 10% and spins
 * 45° draws more attention than the panel it opens. When the panel is open the
 * icon becomes a close icon, which says the same thing the rotation was
 * reaching for and says it literally.
 */
const WidgetStudioFab: React.FC<WidgetStudioFabProps> = ({
  bottomOffset = 80,
}) => {
  const { toggleWidgetStudioPanel, widgetStudioPanelOpen } = useWidgetStudio();

  return (
    <Tooltip
      title={
        widgetStudioPanelOpen ? "Close AI Widget Studio" : "AI Widget Studio"
      }
      placement="left"
    >
      <Fab
        id="widget-studio-fab"
        color="primary"
        size="medium"
        onClick={toggleWidgetStudioPanel}
        sx={(theme) => ({
          position: "fixed",
          bottom: bottomOffset,
          right: 24,
          zIndex: 1200,
          boxShadow: hoverElevation(theme),
          transition: theme.transitions.create("background-color", {
            duration: 150,
          }),
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: hoverElevation(theme),
          },
        })}
        aria-label={
          widgetStudioPanelOpen
            ? "Close AI Widget Studio"
            : "Open AI Widget Studio"
        }
      >
        {widgetStudioPanelOpen ? (
          <CloseRounded sx={{ fontSize: 22 }} />
        ) : (
          <AutoFixHighRounded sx={{ fontSize: 22 }} />
        )}
      </Fab>
    </Tooltip>
  );
};

export default WidgetStudioFab;
