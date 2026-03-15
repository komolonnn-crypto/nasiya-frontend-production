import React, { useState } from "react";

import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TablePagination,
} from "@mui/material";

import { Scrollbar } from "@/components/scrollbar";
import { TableNoData } from "./TableNoData";
import {
  excelHeaderCellStyle,
  excelBodyCellStyle,
  excelRowStyle,
  excelTableContainerStyle,
  excelCardStyle,
  excelPaginationStyle,
} from "./excel-table-styles";

import type { Column, TableData } from "./types";

interface TableComponentProps<T extends TableData> {
  columns: Column[];
  data: T[];
  selectedColumns?: string[];
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  noDataText?: string;
}

export function TableComponent<T extends TableData>({
  columns,
  data,
  selectedColumns = columns.map((col) => col.id),
  rowsPerPageOptions = [5, 10, 25],
  initialRowsPerPage = 5,
  onRowClick,
  noDataText = "No data found",
}: TableComponentProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const renderCellValue = (row: T, column: Column) => {
    if (column.renderCell) {
      return column.renderCell(row);
    }
    const value = row[column.id];
    return column.format ? column.format(value) : value;
  };

  return (
    <Card sx={excelCardStyle}>
      <Scrollbar>
        <TableContainer sx={excelTableContainerStyle}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns
                  .filter((column) => selectedColumns.includes(column.id))
                  .map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        ...excelHeaderCellStyle,
                        minWidth: column.minWidth || 100,
                        width: column.width, 
                        maxWidth: column.width,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    hover
                    key={row._id || index}
                    onClick={() => onRowClick?.(row)}
                    sx={{ 
                      ...excelRowStyle,
                      cursor: onRowClick ? "pointer" : "default",
                    }}
                  >
                    {columns
                      .filter((column) => selectedColumns.includes(column.id))
                      .map((column) => (
                        <TableCell
                          key={`${row._id || index}-${column.id}`}
                          align={column.align || "left"}
                          sx={{ 
                            ...excelBodyCellStyle,
                            width: column.width,
                            maxWidth: column.width,
                          }}
                        >
                          {renderCellValue(row, column)}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={selectedColumns.length} />
                </TableRow>
              )}

              {data.length === 0 && (
                <TableNoData
                  columns={columns.length}
                  searchQuery={noDataText}
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={excelPaginationStyle}
      />
    </Card>
  );
}
