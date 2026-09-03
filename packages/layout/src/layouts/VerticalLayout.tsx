import React from 'react'
import type { ChildrenType } from '@cap/shared-types'
import { Box } from '@mui/material'
import LayoutContent from '../components/vertical/LayoutContent'
import { verticalLayoutClasses } from '../utils/layoutClasses'
import classnames from 'classnames'

const VerticalLayout: React.FC<
  ChildrenType & {
    navigation?: React.ReactNode
    navbar?: React.ReactNode
    footer?: React.ReactNode
  }
> = ({ children, navbar, footer, navigation }) => {
  return (
    <Box
      className={classnames(verticalLayoutClasses.root)}
      sx={{ display: 'flex', flex: '1 1 auto' }}
    >
      {navigation ? <Box component="aside">{navigation}</Box> : null}
      <Box
        className={classnames(verticalLayoutClasses.contentWrapper)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minInlineSize: '0px',
          inlineSize: '100%',
        }}
      >
        {navbar ? <Box component="header">{navbar}</Box> : null}
        <LayoutContent>{children}</LayoutContent>
        {footer ? <Box component="footer">{footer}</Box> : null}
      </Box>
    </Box>
  )
}

export default VerticalLayout
