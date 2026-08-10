import { Box, Typography } from '@mui/material'
import empty from "@cap/theme/assets/images/empty.png";

interface EmptyProps {
  text?: string
  width?: string
  height?: string
  showText?: boolean
}

export default function Empty({
  text = 'No data found',
  width = '100%',
  height = '100%',
  showText = false,
}: EmptyProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      {showText === true ? (
        <Typography variant='h4'> {text} </Typography>
      ) : (
        <img
          src={empty}
          alt='images'
          style={{
            width: width,
            height: height,
          }}
        />
      )}
    </Box>
  )
}
