import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ChildrenType } from '@cap/shared-types'

export interface LayoutEngineContextValue {
  isCustomMode: boolean
  toggleCustomMode: () => void
}

const LayoutEngineContext = createContext<LayoutEngineContextValue | undefined>(undefined)

export const LayoutEngineProvider: React.FC<ChildrenType> = ({ children }) => {
  const [isCustomMode, setIsCustomMode] = useState(false)

  const toggleCustomMode = useCallback(() => {
    setIsCustomMode((prev) => !prev)
  }, [])

  return (
    <LayoutEngineContext.Provider value={{ isCustomMode, toggleCustomMode }}>
      {children}
    </LayoutEngineContext.Provider>
  )
}

export const useLayoutEngineContext = () => {
  const context = useContext(LayoutEngineContext)
  if (!context) {
    throw new Error('useLayoutEngineContext must be used within a LayoutEngineProvider')
  }
  return context
}
