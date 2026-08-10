import React from 'react'
import { Button } from '@mui/material'

export const SkipToContent: React.FC = () => {
  return (
    <Button
      href="#main-content"
      variant="contained"
      color="primary"
      sx={{
        position: 'absolute',
        left: -9999,
        top: 8,
        zIndex: 9999,
        '&:focus': {
          left: 16,
        },
      }}
    >
      Skip to main content
    </Button>
  )
}

export default SkipToContent
