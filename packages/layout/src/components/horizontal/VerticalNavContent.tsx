import PerfectScrollbar from 'react-perfect-scrollbar'
import type { ChildrenType } from '../../menu/types'
import NavHeader from '../../menu/components/vertical-menu/NavHeader'
import NavCollapseIcons from '../../menu/components/vertical-menu/NavCollapseIcons'
import { useHorizontalNav } from '../../menu/contexts/horizontalNavContext'
import { mapHorizontalToVerticalMenu } from '../../menu/utils/menuUtils'
import Logo from '../../assets/svg/Logo'

const VerticalNavContent = ({ children }: ChildrenType) => {
  const { isBreakpointReached } = useHorizontalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <>
      <NavHeader>
        <Logo />
        <NavCollapseIcons
          lockedIcon={<i className='tabler-circle-dot text-xl' />}
          unlockedIcon={<i className='tabler-circle text-xl' />}
          closeIcon={<i className='tabler-x text-xl' />}
        />
      </NavHeader>
      <ScrollWrapper
        {...(isBreakpointReached
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        {mapHorizontalToVerticalMenu(children)}
      </ScrollWrapper>
    </>
  )
}

export default VerticalNavContent
