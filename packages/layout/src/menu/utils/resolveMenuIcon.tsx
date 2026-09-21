import React from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import PaletteOutlined from '@mui/icons-material/PaletteOutlined'
import LinkOutlined from '@mui/icons-material/LinkOutlined'
import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import SettingsOutlined from '@mui/icons-material/SettingsOutlined'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import MailOutlined from '@mui/icons-material/MailOutlined'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import BarChartOutlined from '@mui/icons-material/BarChartOutlined'
import DesktopWindowsOutlined from '@mui/icons-material/DesktopWindowsOutlined'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import CircleOutlined from '@mui/icons-material/CircleOutlined'

/**
 * Module nav/search items may declare their icon as a tabler class name
 * (`'tabler-palette'` or bare `'palette'`), but the app ships no tabler icon
 * font - an `<i className="tabler-...">` renders as an empty box, and the
 * collapsed rail then shows the clipped label text instead of an icon.
 * Resolve those names to MUI icons, falling back to a neutral glyph so an
 * item can never render without one.
 */
const TABLER_TO_MUI: Record<string, SvgIconComponent> = {
  dots: MoreHoriz,
  palette: PaletteOutlined,
  link: LinkOutlined,
  dashboard: DashboardOutlined,
  settings: SettingsOutlined,
  user: PersonOutlined,
  'users-group': PeopleOutlined,
  mail: MailOutlined,
  calendar: CalendarTodayOutlined,
  'chart-bar': BarChartOutlined,
  'device-desktop-analytics': DesktopWindowsOutlined,
  sparkles: AutoAwesomeOutlined,
  box: Inventory2Outlined,
}

export const resolveMenuIcon = (icon: unknown): React.ReactElement | undefined => {
  if (!icon) return undefined
  if (React.isValidElement(icon)) return icon
  if (typeof icon !== 'string') return undefined

  const Icon = TABLER_TO_MUI[icon.replace(/^tabler-/, '')] ?? CircleOutlined
  return <Icon fontSize='inherit' />
}
