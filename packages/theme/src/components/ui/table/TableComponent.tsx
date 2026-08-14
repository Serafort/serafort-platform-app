import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Skeleton } from '@mui/material';
import TableValue from './TableValue';
import type { ITableData, ITableHeader, ITableRow } from './types';
// 

type ITableComponentI = {
  loading: boolean
  hideActionMode?: boolean
  data: ITableData
  rowsPerPage: number
  page: number
  onClick?: Function
  TableOptions?: React.JSX.Element
}

class TableComponent extends React.PureComponent<ITableComponentI> {
  constructor(readonly props: ITableComponentI) {
    super(props)
  }

  render() {
    const { loading, data, rowsPerPage, page } = this.props
    const fillArray = Array.apply(null, Array(5)).map((_, idx) => idx)
    const properties = []
    for (let i = 0; i < data.header.length; i += 1) properties.push(data.header[i].key)

    // const hideActionMode = this.props?.hideActionMode ?? false
    // const loading = this.props?.loading ?? false
    // const TableOptions = this.props?.TableOptions ?? function () {}
    // const rowsPerPage = this.props?.rowsPerPage ?? 10
    // const page = this.props?.page ?? 0
    // const onClick = this.props?.onClick ?? function () {}

    // const rows = { data: data?.body }

    // const options = []
    // for (let i = 0; i < data?.headers?.length; i += 1)
    //   if (data?.header[i]?.options)
    //     options.push({
    //       key: data?.headers[i]?.key,
    //       options: data?.headers[i]?.options,
    //     })
    // if (this.state.idDelete) {
    //   for (let i = 0; i < rows.data.length; i += 1) {
    //     if (rows.data[i].id === this.state.idDelete) rows.data.splice(i, 1)
    //   }
    //   this.state.idDelete = ''
    // }

    return (
      <Table sx={{ minWidth: 650 }} stickyHeader aria-label='sticky table'>
        <TableHead>
          <TableRow>
            {data?.header?.map((item: ITableHeader) => (
              <TableCell key={`${item.label}${Math.random()}${item.key}${Math.random()}`}>
                {item.label}
              </TableCell>
            ))}
            {this.props?.TableOptions && (
              <TableCell key={`actions${Math.random() * properties.length}}`}>
                {/* // {translate('actions')} */}
                actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody key={`TableBody${Math.random()}`}>
          {/* <FixedSizeList
              height={100}
              width={100}
              itemCount={rows?.data?.length}
              itemSize={20}
            >
              cc
            </FixedSizeList> */}
          {loading &&
            fillArray.map(() => (
              <TableRow key={`TableRow${Math.random()}`}>
                {data.header.map((item: ITableHeader) => (
                  <TableCell key={`${item.label}${Math.random()}`}>
                    <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            data.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: ITableRow) => (
                <TableRow hover key={`${row?.id ? row?.id : Math.random()}`}>
                  {data.header.map((header: ITableHeader) => (
                    <TableCell
                      key={`${
                        Object.keys(row).filter((value) => value === header.key)[0]
                      }${Math.random()}${header.key}${Math.random()}`}
                    >
                      <TableValue property={header} row={row} />
                    </TableCell>
                  ))}
                  {/* {this.props?.TableOptions && (
                      <TableCell align='right'>
                        <TableOptions data={row} onClick={onClick} />
                      </TableCell>
                    )} */}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    )
  }
}
export default TableComponent
