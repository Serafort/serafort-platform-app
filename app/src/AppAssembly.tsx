import React, { useState, useEffect } from 'react'
import { assembleApp } from '@cap/platform-core'
import { LayoutRouteWrapper } from '@cap/layout'
import type { CAPModule } from '@cap/shared-types'

// Dynamic runtime store for uploaded / runtime registered modules
const dynamicModulesStore: CAPModule[] = []
const dynamicListeners = new Set<() => void>()

export const registerDynamicModule = (moduleContract: CAPModule) => {
  if (!dynamicModulesStore.some((m) => m.id === moduleContract.id)) {
    dynamicModulesStore.push(moduleContract)
    dynamicListeners.forEach((listener) => listener())
  }
}

// The glob automatically imports all index.ts files it finds in the modules directory
const moduleImports = import.meta.glob('../../packages/modules/*/src/index.ts', { eager: true })

export const assembleModules = (): CAPModule[] => {
  const assembledModules: CAPModule[] = []
  const registeredIds = new Set<string>()

  // 1. Static Vite glob imports
  for (const path in moduleImports) {
    const mod = moduleImports[path] as Record<string, any>

    for (const key in mod) {
      const exportVal = mod[key]
      if (
        exportVal &&
        typeof exportVal === 'object' &&
        typeof exportVal.id === 'string' &&
        typeof exportVal.version === 'string'
      ) {
        if (!registeredIds.has(exportVal.id)) {
          registeredIds.add(exportVal.id)
          assembledModules.push(exportVal as CAPModule)
        }
      }
    }
  }

  // 2. Dynamic runtime modules
  for (const mod of dynamicModulesStore) {
    if (!registeredIds.has(mod.id)) {
      registeredIds.add(mod.id)
      assembledModules.push(mod)
    }
  }

  return assembledModules
}

export const globalModules = assembleModules()

export const App: React.FC = () => {
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const handleUpdate = () => setRevision((r) => r + 1)
    dynamicListeners.add(handleUpdate)
    return () => {
      dynamicListeners.delete(handleUpdate)
    }
  }, [])

  const AssembledAppComponent = React.useMemo(() => {
    const currentModules = assembleModules()
    return assembleApp({ modules: currentModules, layoutWrapper: LayoutRouteWrapper })
  }, [revision])

  return <AssembledAppComponent />
}

export default App
