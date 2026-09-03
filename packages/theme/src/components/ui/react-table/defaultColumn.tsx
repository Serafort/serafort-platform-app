import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { IPerson } from './types'

const defaultColumn: Partial<ColumnDef<IPerson>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue()
    // We need to keep and update the state of the cell normally
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return (
      <input value={value as string} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />
    )
  },
}
export default defaultColumn
