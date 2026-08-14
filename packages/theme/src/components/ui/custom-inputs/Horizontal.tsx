import { styled } from '@mui/material/styles'
import classnames from 'classnames'
import type { CustomInputHorizontalProps } from './types'
import { Typography, Radio, Checkbox, Grid } from '@mui/material'

const Root = styled('div', {
  name: 'MuiCustomInputHorizontal',
  slot: 'root',
})(({ theme }) => ({
  blockSize: '100%',
  display: 'flex',
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  position: 'relative',
  alignItems: 'flex-start',
  border: `1px solid `,
  padding: theme.spacing(4),
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['border-color'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover': {
    borderColor: theme.palette.action.active,
  },
  '&.active': {
    borderColor: theme.palette.primary.main,
    '& i, & svg': {
      color: ` !important`,
    },
  },
}))

const Title = styled(Typography, {
  name: 'MuiCustomInputHorizontal',
  slot: 'title',
})(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  color: ` !important`,
}))

const Meta = styled(Typography, {
  name: 'MuiCustomInputHorizontal',
  slot: 'meta',
})(({ theme }) => ({
  ...theme.typography.body2,
  color: ` !important`,
}))

const Content = styled(Typography, {
  name: 'MuiCustomInputHorizontal',
  slot: 'content',
})(({ theme }) => ({
  ...theme.typography.body2,
}))

const RadioInput = styled(Radio, {
  name: 'MuiCustomInputHorizontal',
  slot: 'input',
})(({ theme }) => ({
  marginBlockStart: theme.spacing(-0.25),
  marginInlineStart: theme.spacing(-0.25),
}))

const CheckboxInput = styled(Checkbox, {
  name: 'MuiCustomInputHorizontal',
  slot: 'input',
})(({ theme }) => ({
  marginBlockStart: theme.spacing(-0.25),
  marginInlineStart: theme.spacing(-0.25),
}))

const CustomInputHorizontal = (props: CustomInputHorizontalProps) => {
  const { type, data, name, selected, gridProps, handleChange, color = 'primary' } = props
  const { meta, title, value, content } = data

  const renderData = () => {
    if (meta && title && content) {
      return (
        <div className='flex flex-col bs-full is-full gap-1.5'>
          <div className='flex items-start justify-between is-full mbs-1.5'>
            {typeof title === 'string' ? <Title>{title}</Title> : title}
            {typeof meta === 'string' ? <Meta>{meta}</Meta> : meta}
          </div>
          {typeof content === 'string' ? <Content>{content}</Content> : content}
        </div>
      )
    } else if (meta && title && !content) {
      return (
        <div className='flex items-start justify-between is-full mbs-1.5'>
          {typeof title === 'string' ? <Title>{title}</Title> : title}
          {typeof meta === 'string' ? <Meta>{meta}</Meta> : meta}
        </div>
      )
    } else if (!meta && title && content) {
      return (
        <div className='flex flex-col bs-full gap-1 mbs-1.5'>
          {typeof title === 'string' ? <Title>{title}</Title> : title}
          {typeof content === 'string' ? <Content>{content}</Content> : content}
        </div>
      )
    } else if (!meta && !title && content) {
      return typeof content === 'string' ? (
        <Content className='mbs-1.5'>{content}</Content>
      ) : (
        content
      )
    } else if (!meta && title && !content) {
      return typeof title === 'string' ? <Title className='mbs-1.5'>{title}</Title> : title
    } else {
      return null
    }
  }

  return data ? (
    <Grid {...gridProps}>
      <Root
        onClick={() => handleChange(value)}
        className={classnames({
          active: type === 'radio' ? selected === value : selected.includes(value),
        })}
      >
        {type === 'radio' ? (
          <RadioInput
            name={name}
            color={color}
            value={value}
            onChange={handleChange}
            checked={selected === value}
          />
        ) : (
          <CheckboxInput
            color={color}
            name={`${name}-${value}`}
            checked={selected.includes(value)}
            onChange={() => handleChange(value)}
          />
        )}
        {renderData()}
      </Root>
    </Grid>
  ) : null
}

export default CustomInputHorizontal
