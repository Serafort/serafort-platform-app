import type { ITableHeader, ITableRow } from './types'

export default function TableValue({ property, row }: { property: ITableHeader; row: ITableRow }) {
  /* {item.endsWith('_at') && convertToRelativeDate(row[item])}
                      {!item.endsWith('_at') && translate(row[item])}
  
                      {options
                        .filter((option) => option.key === item)[0]
                        ?.options?.online(
                          row?.online,
                          row?.validated_by_profile_id,
                        )} */

  /* {console.log(
                        options
                          .filter((option) => option.key === item)[0]
                          ?.options?.icon(
                            row?.online,
                            row?.validated_by_profile_id,
                          ),
                      )} */

  /* {console.log(
                        options
                          .filter((option) => option.key === item)[0]
                          ?.options.icon(row[item]),
                      )} */

  if (property?.getCellValue !== undefined) return property?.getCellValue(row)

  return row[property.key]
}
