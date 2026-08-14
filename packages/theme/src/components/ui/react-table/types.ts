import type { RankingInfo } from '@tanstack/match-sorter-utils'
import type { FilterFn, OnChangeFn, RowData, Updater } from '@tanstack/react-table'

export type DensityState = 'sm' | 'md' | 'lg'

export interface DensityTableState {
  density: DensityState
}

// define types for our new feature's table options
export interface DensityOptions {
  enableDensity?: boolean
  onDensityChange?: OnChangeFn<DensityState>
}

// Define types for our new feature's table APIs
export interface DensityInstance {
  setDensity: (updater: Updater<DensityState>) => void
  toggleDensity: (value?: DensityState) => void
}

export type IPerson = {
  firstName: string
  lastName: string
  age: number
  visits: number
  progress: number
  status: 'relationship' | 'complicated' | 'single'
  subRows?: Array<IPerson>
}

export type UsersTypeWithAction = IPerson & {
  action?: string
}

export type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

// type UserStatusType = {
//   [key: string]: ThemeColor
// }

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
  interface TableState extends DensityTableState {}
  interface TableOptionsResolved<TData extends RowData> extends DensityOptions {}
  interface Table<TData extends RowData> extends DensityInstance {}

  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}
