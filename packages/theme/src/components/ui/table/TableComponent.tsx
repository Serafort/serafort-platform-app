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
    const skeletonRows = Array.from({ length: 5 }, (_, idx) => idx);

    return (
      <Table sx={{ minWidth: 650 }} stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {data?.header?.map((header: ITableHeader) => (
              <TableCell key={header.key}>{header.label}</TableCell>
            ))}
            {this.props?.TableOptions && (
              <TableCell key="__actions__">
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
            skeletonRows.map((rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {data.header.map((header: ITableHeader) => (
                  <TableCell key={`skeleton-${rowIndex}-${header.key}`}>
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            data.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: ITableRow, rowIndex: number) => {
                const rowKey = row?.id ?? rowIndex;
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
