import { useAppStore } from '@cap/platform-store'

export const useHorizontalNav = () => {
  const horizontalNav = useAppStore((state) => state.horizontalNav)
  const updateIsBreakpointReached = useAppStore((state) => state.updateIsBreakpointReached)

  return {
    ...horizontalNav,
    updateIsBreakpointReached,
  }
}
