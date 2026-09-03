import { Box, CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <Box
      sx={{ position: 'relative', display: 'flex' }}
      justifyContent='center'
      alignContent='center'
      alignItems='center'
    >
      <CircularProgress
        sx={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}
