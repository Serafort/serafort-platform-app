export type ITableHeader = {
  key: string
  label: string
  getCellValue?: Function
}

export type ITableRow = {
  [key: string]: string | number
  id: number
  firstname: string | any
  phone: string | any
}

export type ITableData = {
  header: Array<ITableHeader>
  rows: Array<ITableRow>
}

export type IHandleChange = {
  event?: any
  value?: number | string
  values?: any
}

export type ITabsHeader = {
  key: string
  label: string
}

export type IQuery = {
  value: string
  columns: Array<string>
}

export type IFilterValue = {
  key: string
  label: string
}
export interface IFilter extends IFilterValue {
  values: Array<IFilterValue>
}
