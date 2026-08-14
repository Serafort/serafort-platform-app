import React from 'react'
import { Fab, Tooltip } from '@mui/material'
import AutoFixHighRounded from '@mui/icons-material/AutoFixHighRounded'
import { useWidgetStudio } from '@cap/platform-store'

interface WidgetStudioFabProps {
  /** Vertical offset from the bottom (default: 80) — stacks above CustomModeFab */
  bottomOffset?: number
}

/**
 * Floating Action Button that opens the AI Widget Studio panel.
 * Placed on the Dashboard screen alongside CustomModeFab.
 */
const WidgetStudioFab: React.FC<WidgetStudioFabProps> = ({ bottomOffset = 80 }) => {
  const { toggleWidgetStudioPanel, widgetStudioPanelOpen } = useWidgetStudio()

  return (
    <Tooltip
      title={widgetStudioPanelOpen ? 'Close AI Widget Studio' : 'AI Widget Studio'}
      placement="left"
    >
      <Fab
        id="widget-studio-fab"
        color="primary"
        size="medium"
        onClick={toggleWidgetStudioPanel}
        sx={{
          position: 'fixed',
          bottom: bottomOffset,
          right: 24,
          zIndex: 1200,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: (theme) =>
            `0 4px 20px ${theme.palette.primary.main}44`,
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: (theme) => `0 6px 28px ${theme.palette.primary.main}66`,
          },
          ...(widgetStudioPanelOpen && {
            transform: 'rotate(45deg)',
          }),
        }}
        aria-label="Open AI Widget Studio"
      >
        <AutoFixHighRounded sx={{ fontSize: 22 }} />
      </Fab>
    </Tooltip>
  )
}

export default WidgetStudioFab
