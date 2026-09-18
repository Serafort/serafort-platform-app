import type { ChildrenType, SystemMode } from '@cap/shared-types'
import { useSettings } from '@cap/platform-store'
import { blankLayoutClasses } from '../utils/layoutClasses'
import classnames from 'classnames'

type Props = ChildrenType & {
  systemMode: SystemMode
}

const BlankLayout = (props: Props) => {
  const { children } = props
  const { settings } = useSettings()

  return (
    <div
      className={classnames(blankLayoutClasses.root, 'is-full bs-full')}
      data-skin={settings.skin}
    >
      {children}
    </div>
  )
}

export default BlankLayout
