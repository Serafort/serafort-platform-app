import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import type { IPerson } from './types'
import LocalTable from './LocalTable'
import columnDefault from './columns'

export default function App() {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo<Array<ColumnDef<IPerson>>>(() => columnDefault, [])

  const [data, setData] = React.useState<IPerson[]>([])

  const refreshData = () => {
    setData([]) // Clear data or fetch new data
  }

  return (
    <>
      <LocalTable {...{ data, columns }} />
      <hr />
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
    </>
  )
}
