import { useAppStore } from '@cap/platform-store';

export const useVerticalNav = () => {
  const verticalNav = useAppStore((state) => state.verticalNav)
  const updateVerticalNavState = useAppStore((state) => state.updateVerticalNavState)
  const collapseVerticalNav = useAppStore((state) => state.collapseVerticalNav)
  const hoverVerticalNav = useAppStore((state) => state.hoverVerticalNav)
  const toggleVerticalNav = useAppStore((state) => state.toggleVerticalNav)

  return {
    ...verticalNav,
    updateVerticalNavState,
    collapseVerticalNav,
    hoverVerticalNav,
    toggleVerticalNav,
  }
}
