export type ITableHeader = {
  key: string;
  label: string;
  getCellValue?: Function;
};

/**
 * Generic table row type.
 * Requires an `id` field and allows any other string/number values.
 * Use this as a base and extend with your own types for specific tables.
 *
 * @example
 * ```typescript
 * interface UserRow extends ITableRow {
 *   firstname: string
 *   phone: string
 * }
 * ```
 */
export type ITableRow = {
  id: string | number;
  [key: string]: unknown;
};

/**
 * Create a typed table row with specific fields.
 * @example
 * ```typescript
 * type UserRow = TypedTableRow<{ firstname: string; phone: string }>
 * ```
 */
export type TypedTableRow<T extends Record<string, unknown> = {}> = {
  id: string | number;
} & T;

export type ITableData = {
  header: Array<ITableHeader>;
  rows: Array<ITableRow>;
};

export type IHandleChange = {
  event?: any;
  value?: number | string;
  values?: any;
};

export type ITabsHeader = {
  key: string;
  label: string;
};

export type IQuery = {
  value: string;
  columns: Array<string>;
};

export type IFilterValue = {
  key: string;
  label: string;
};
export interface IFilter extends IFilterValue {
  values: Array<IFilterValue>;
}
