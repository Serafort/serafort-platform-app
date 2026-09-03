import React from 'react'
import type { ChildrenType } from '@cap/shared-types'
import Box from '@mui/material/Box'
import { horizontalLayoutClasses } from '../../utils/layoutClasses'
import classnames from 'classnames'

const Navbar: React.FC<ChildrenType> = ({ children }) => {
  return (
    <Box
      className={classnames(horizontalLayoutClasses.navbar)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        inlineSize: '100%',
      }}
    >
      {children}
    </Box>
  )
}

export default Navbar
