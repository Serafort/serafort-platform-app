import React, { useState } from 'react'
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Zoom } from '@mui/material'
import Check from '@mui/icons-material/Check';
import Edit from '@mui/icons-material/Edit';
import Storefront from '@mui/icons-material/Storefront';
import Palette from '@mui/icons-material/Palette';
import Add from '@mui/icons-material/Add';
import Tune from '@mui/icons-material/Tune';
import AutoFixHighRounded from '@mui/icons-material/AutoFixHighRounded';
import { widgetMarketplaceStore } from '../../store/widgetMarketplaceStore'
import { themeEditorStore } from '../../store/themeEditorStore'
import { useAppStore } from '@cap/platform-store'
import type { TenantThemeConfig } from '../../types'

export interface CustomModeFabProps {
  customMode: boolean
  onToggle: () => void
  pageId?: string
}

/**
 * SpeedDial Floating Action Button panel for layout customization:
 * - Toggle Custom/Classic Mode
 * - Open Widget & Canvas Marketplace Drawer
 * - Open Live Theme Builder Drawer (as referenced in ModeDropdown)
 * - Add Panel Slot
 */
export const CustomModeFab: React.FC<CustomModeFabProps> = ({ customMode, onToggle, pageId = 'dashboard' }) => {
  const [open, setOpen] = useState(false)
  const addPanel = useAppStore((state) => state.addPanel)

  const openWidgetStudioPanel = useAppStore((state) => state.openWidgetStudioPanel)

  const handleOpenWidgetStudio = () => {
    setOpen(false)
    openWidgetStudioPanel()
  }

  const handleOpenMarketplace = () => {
    setOpen(false)
    widgetMarketplaceStore.openMarketplace(pageId, 0)
  }

  const handleOpenThemeBuilder = () => {
    setOpen(false)
    themeEditorStore.startEditing({} as TenantThemeConfig)
  }

  const handleAddPanel = () => {
    setOpen(false)
    addPanel(pageId)
  }

  const handleToggleCustomMode = () => {
    setOpen(false)
    onToggle()
  }

  const actions = [
    {
      icon: <AutoFixHighRounded color="secondary" />,
      name: 'AI Widget Studio (Gemini)',
      onClick: handleOpenWidgetStudio,
    },
    {
      icon: <Storefront color="primary" />,
      name: 'Widget & Canvas Marketplace',
      onClick: handleOpenMarketplace,
    },
    {
      icon: <Palette color="secondary" />,
      name: 'Theme Customizer Builder',
      onClick: handleOpenThemeBuilder,
    },
    {
      icon: <Add color="info" />,
      name: 'Add Empty Panel Slot',
      onClick: handleAddPanel,
    },
    {
      icon: customMode ? <Check color="success" /> : <Tune color="action" />,
      name: customMode ? 'Exit Custom Mode' : 'Enter Custom Edit Mode',
      onClick: handleToggleCustomMode,
    },
  ]

  return (
    <Zoom in>
      <SpeedDial
        ariaLabel="Dashboard Customization FAB Panel"
        sx={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          zIndex: (theme) => theme.zIndex.speedDial,
          '& .MuiFab-primary': {
            minWidth: 56,
            minHeight: 56,
            bgcolor: customMode ? 'primary.main' : 'background.paper',
            color: customMode ? 'primary.contrastText' : 'text.primary',
            boxShadow: 4,
            '&:hover': {
              bgcolor: customMode ? 'primary.dark' : 'action.hover',
            },
          },
        }}
        icon={<SpeedDialIcon icon={<Edit />} openIcon={<Check />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
            FabProps={{
              sx: {
                minWidth: 48,
                minHeight: 48,
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 2,
              },
            }}
          />
        ))}
      </SpeedDial>
    </Zoom>
  )
}

export default CustomModeFab
