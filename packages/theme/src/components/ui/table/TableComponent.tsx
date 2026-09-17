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
            {/* Bolt: Optimization to remove Math.random() in keys which causes unnecessary re-renders. Use stable identifiers. */}
            {data?.header?.map((item: ITableHeader) => (
              <TableCell
                key={`${item.key}`}
              >
                {item.label}
              </TableCell>
            ))}
            {this.props?.TableOptions && (
              <TableCell key={`actions`}>
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
            fillArray.map((_, idx) => (
              <TableRow key={`TableRowSkeleton-${idx}`}>
                {data.header.map((item: ITableHeader) => (
                  <TableCell key={`${item.key}`}>
                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            data.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: ITableRow, index: number) => (
                <TableRow hover key={`${row?.id ? row.id : index}`}>
                  {data.header.map((header: ITableHeader) => (
                    <TableCell
                      key={`${header.key}`}
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
    );
  }
}
export default TableComponent;
