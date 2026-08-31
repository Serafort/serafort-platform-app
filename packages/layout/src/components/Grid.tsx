import React from 'react'
import { Grid as MuiGrid, type GridProps } from '@cap/theme'

const Grid: React.FC<GridProps> = (props) => {
  return <MuiGrid {...props} />
}

export default Grid
