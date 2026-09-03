import { styled } from '@cap/theme'
import type { RootStylesType } from '../../types'
import type { VerticalMenuContextProps } from '../../contexts/verticalMenuContext'

type StyledVerticalNavExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

export const StyledVerticalNavExpandIconWrapper = styled('span')<RootStylesType>`
  display: flex;
  margin-inline-start: 5px;
  ${({ rootStyles }: RootStylesType) => rootStyles}
`

export const StyledVerticalNavExpandIcon = styled('span')<
StyledVerticalNavExpandIconProps>`
  display: flex;

  & > i,
  & > svg {
    transition: ${({ transitionDuration }: StyledVerticalNavExpandIconProps) =>
    `transform ${transitionDuration}ms ease-in-out`};
  ${({ open }: StyledVerticalNavExpandIconProps) =>
    open &&
    `
    transform: rotate(90deg);
  `}
  }

  [dir='rtl'] & > i,
  [dir='rtl'] & > svg {
    transform: rotate(180deg);
    ${({ open }) => open && 'transform: rotate(90deg);'}
  }
`

export default StyledVerticalNavExpandIcon
