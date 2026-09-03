import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'

const AppReactDropzone = styled(Box)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 300,
    display: 'flex',
    flexWrap: 'wrap',
    cursor: 'pointer',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    border: `2px dashed `,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    '&:focus': {
      outline: 'none',
    },
  },
}))

export default AppReactDropzone
