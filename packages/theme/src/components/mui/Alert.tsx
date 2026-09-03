import React from 'react'
import MuiAlert from '@mui/material/Alert'

// eslint-disable-next-line react/display-name, react-refresh/only-export-components
export default React.forwardRef((props: any, ref: any) => (
  <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
))
