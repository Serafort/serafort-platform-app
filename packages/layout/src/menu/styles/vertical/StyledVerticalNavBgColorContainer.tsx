import { styled } from '@cap/theme'
import type { VerticalNavProps } from '../../components/vertical-menu/VerticalNav'

type StyledVerticalNavBgColorContainerProps = Pick<VerticalNavProps, 'backgroundColor'>

const StyledVerticalNavBgColorContainer = styled('div')<StyledVerticalNavBgColorContainerProps>(({ backgroundColor }: any) => ({
  position: 'relative',
  blockSize: '100%',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: backgroundColor || 'transparent',
}))

export default StyledVerticalNavBgColorContainer
