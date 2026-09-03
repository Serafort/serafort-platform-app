import React from 'react'
import { Box } from '@mui/material'
import { zIndexScale } from '@cap/theme'
import LayoutContent from '../components/horizontal/LayoutContent'
import type { ChildrenType } from '@cap/shared-types'

const PublicLayout: React.FC<
  ChildrenType & {
    header?: React.ReactNode
    footer?: React.ReactNode
  }
> = ({ header, footer, children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Header Section */}
      <Box
        component='header'
        sx={{
          color: 'white',
          width: '100%',
          zIndex: zIndexScale.layout.header,
        }}
      >
        {header || null}
      </Box>

      {/* Main Content Area */}
      <Box component='main' sx={{ flex: '1 1 auto' }}>
        <LayoutContent>{children}</LayoutContent>
      </Box>

      {/* Footer Section */}
      <Box
        component='footer'
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          width: '100%',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {footer || null}
      </Box>
    </Box>
  )
}

export default PublicLayout
