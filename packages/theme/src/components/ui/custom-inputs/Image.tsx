import { styled } from '@mui/material/styles'
import classnames from 'classnames'
import type { CustomInputImgProps } from './types'
import { Checkbox, Grid } from '@mui/material'

const Root = styled('div', {
  name: 'MuiCustomImage',
  slot: 'Root',
})(({ theme }) => ({
  blockSize: '100%',
  display: 'flex',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  border: `1px solid `,

  '&:hover': {
    borderColor: theme.palette.action.active,
  },
  '&.active': {
    borderColor: theme.palette.primary.main,
  },
  '&:not(.active):not(:hover) .MuiCheckbox-root': {
    display: 'none',
  },
}))

const CheckboxInput = styled(Checkbox, {
  name: 'MuiCustomImage',
  slot: 'Input',
})({
  top: 7,
  right: 7,
  position: 'absolute',
})

const Image = styled('img', {
  name: 'MuiCustomImage',
  slot: 'Image',
})({
  maxWidth: '100%',
})

const CustomCheckboxImg = (props: CustomInputImgProps) => {
  const { type, data, name, selected, gridProps, handleChange, color = 'primary' } = props
  const { alt, img, value } = data

  const renderComponent = () => {
    return (
      <Grid {...gridProps}>
        <Root
          className={classnames({ active: selected.includes(value) })}
          onClick={() => handleChange(value)}
        >
          {typeof img === 'string' ? (
            <Image src={img} alt={alt ?? `checkbox-image-${value}`} />
          ) : (
            img
          )}
          {type === 'radio' ? null : (
            <CheckboxInput
              color={color}
              name={`${name}-${value}`}
              checked={selected.includes(value)}
              onChange={() => handleChange(value)}
            />
          )}
        </Root>
      </Grid>
    )
  }

  return data ? renderComponent() : null
}

export default CustomCheckboxImg
