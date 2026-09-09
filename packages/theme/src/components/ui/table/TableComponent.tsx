import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
} from "@mui/material";
import TableValue from "./TableValue";
import type { ITableData, ITableHeader, ITableRow } from "./types";
//

type ITableComponentI = {
  loading: boolean;
  hideActionMode?: boolean;
  data: ITableData;
  rowsPerPage: number;
  page: number;
  onClick?: Function;
  TableOptions?: React.JSX.Element;
};

class TableComponent extends React.PureComponent<ITableComponentI> {
  constructor(readonly props: ITableComponentI) {
    super(props);
  }

  render() {
    const { loading, data, rowsPerPage, page } = this.props;
    const fillArray = Array.apply(null, Array(5)).map((_, idx) => idx);
    const properties = [];
    for (let i = 0; i < data.header.length; i += 1)
      properties.push(data.header[i].key);

    return (
      <Table sx={{ minWidth: 650 }} stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {data?.header?.map((item: ITableHeader) => (
              <TableCell key={`header-${item.key}`}>
                {item.label}
              </TableCell>
            ))}
            {this.props?.TableOptions && (
              <TableCell key="header-actions">
                {/* // {translate('actions')} */}
                actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* <FixedSizeList
              height={100}
              width={100}
              itemCount={rows?.data?.length}
              itemSize={20}
            >
              cc
            </FixedSizeList> */}
          {loading &&
            fillArray.map((_, rowIndex) => (
              <TableRow key={`loading-row-${rowIndex}`}>
                {data.header.map((item: ITableHeader) => (
                  <TableCell key={`loading-cell-${rowIndex}-${item.key}`}>
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            data.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: ITableRow, rowIndex: number) => {
                const rowKey = row?.id ? String(row.id) : `row-${page * rowsPerPage + rowIndex}`;
                return (
                  <TableRow hover key={rowKey}>
                    {data.header.map((header: ITableHeader) => (
                      <TableCell key={`${rowKey}-${header.key}`}>
                        <TableValue property={header} row={row} />
                      </TableCell>
                    ))}
                    {/* {this.props?.TableOptions && (
                        <TableCell align='right'>
                          <TableOptions data={row} onClick={onClick} />
                        </TableCell>
                      )} */}
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    );
  }
}
export default TableComponent;
