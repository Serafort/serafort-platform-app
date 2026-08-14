import React from 'react'
import { Grid, Box, Avatar, Container } from '@mui/material'
import Audiotrack from '@mui/icons-material/Audiotrack'
import { DropzoneOptions } from 'react-dropzone'

type IFile = File & {
  preview: string
}

// function getType(type?: string, ext: Array<string> = []): Accept {
//   switch (type) {
//     case 'audio':
//       return { 'audio/*': ext }

//     default:
//       return {
//         'image/*': ext,
//       }
//   }
// }

export default function Dropzone({
  // message = 'Drag & drop a file here, or click to select one',
  // Icon = CloudUpload,
  type = 'image',
  preview = false,
  // onDrop,
  // options,
  // disabled,
}: {
  message?: string
  Icon?: any
  type?: 'image' | 'audio'
  preview?: boolean
  onDrop: (acceptedFiles: Array<File>) => void
  options?: DropzoneOptions
  disabled?: boolean
}) {
  const [files] = React.useState<Array<IFile>>([])

  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: getType(type),
  //   onDrop: (acceptedFiles: Array<File>) => {
  //     setFiles(
  //       acceptedFiles.map((file) =>
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         }),
  //       ),
  //     )
  //     const files = acceptedFiles.filter((file) =>
  //       file.type.startsWith(`${type}/`),
  //     )
  //     onDrop(files)
  //   },
  //   ...options,
  //   disabled,
  // })

  const thumbs = files.map((file: IFile) => (
    <Grid
      size={{ sm: 2 }}
      key={file.name}
      sx={{
        padding: 4,
        margin: 0,
        display: 'inline-flex',
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        marginBottom: 8,
        marginRight: 8,
        width: 100,
        height: 100,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        {type === 'image' && (
          <Avatar
            className='file-preview'
            src={file?.preview}
            variant='square'
            onLoad={() => {
              URL.revokeObjectURL(file?.preview)
            }}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              background: 'transparent',
            }}
          />
        )}
        {type === 'audio' && (
          <Avatar
            sx={{
              width: '100%',
              height: '100%',
            }}
            variant='square'
          >
            <Audiotrack
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Avatar>
        )}
      </Box>
    </Grid>
  ))

  const thumb = (
    <>
      {type === 'image' && (
        <Avatar
          src={files[0]?.preview}
          variant='square'
          onLoad={() => {
            URL.revokeObjectURL(files[0]?.preview)
          }}
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            background: 'transparent',
          }}
        />
      )}
      {type === 'audio' && (
        <Avatar variant='square'>
          <Audiotrack
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Avatar>
      )}
    </>
  )

  React.useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file: any) => URL.revokeObjectURL(file.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container
      sx={{
        padding: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
      }}
    >
      {/* <AppReactDropzone {...getRootProps()}>
        <input {...getInputProps()} />
        <Icon
          sx={{
            fontSize: 90,
            marginTop: '0px',
          }}
        />
        <Typography marginTop='12px'>{message}</Typography>
      </AppReactDropzone> */}
      {preview && (
        <>
          {files.length === 1 ? (
            thumb
          ) : (
            <Grid
              component='aside'
              container
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 16,
              }}
            >
              {thumbs}
            </Grid>
          )}
        </>
      )}
    </Container>
  )
}
