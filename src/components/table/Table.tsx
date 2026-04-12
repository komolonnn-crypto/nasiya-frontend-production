import React, { useState, useEffect } from "react";

import {
  Table,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TablePagination,
} from "@mui/material";

import { Scrollbar } from "@/components/scrollbar";
import { tableEmptyUz } from "@/utils/table-empty-labels";
import { TableNoData } from "./TableNoData";
import {
  excelHeaderCellStyle,
  excelBodyCellStyle,
  excelRowStyle,
  excelTableContainerStyle,
  excelPaginationStyle,
  excelCheckboxStyle,
  excelStickyLeftStyle,
  excelStickyRightStyle,
  EXCEL_COLORS,
} from "./excel-table-styles";

interface Column<T = any> {
  id: string;
  label: string;
  width?: number;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: T) => string | React.ReactNode;
  renderCell?: (row: T) => React.ReactNode;
  sticky?: "left" | "right";
  stickyOffset?: number;
}

interface TableComponentProps<T> {
  columns: Column[];
  data: T[];
  selectedColumns?: string[];
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  onCustomerClick?: (customer: any) => void;
  onNotesClick?: (row: T) => void;
  filterName?: string;
  noDataText?: string;
  renderActions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  onSelectedRowsChange?: (selectedIds: string[]) => void;
  selectedRowss?: string[];
}

export function TableComponent<T extends Record<string, any>>({
  columns,
  data,
  selectedColumns = columns.map((col) => col.id),
  rowsPerPageOptions = [15, 50, 100, 1000],
  initialRowsPerPage = 100,
  onRowClick,
  filterName = "",
  noDataText = "No data found",
  renderActions,
  selectable = false,
  onSelectedRowsChange,
  selectedRowss,
}: TableComponentProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>(
    [],
  );

  const selectedRows =
    selectedRowss !== undefined ? selectedRowss : internalSelectedRows;
  const setSelectedRows = (rows: string[]) => {
    setInternalSelectedRows(rows);
    onSelectedRowsChange?.(rows);
  };

  const handleSelectAllRows = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const currentPageData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
      const currentPageIds = currentPageData.map(
        (row) => row["_id"] || row["id"],
      );

      const newSelected = [...new Set([...selectedRows, ...currentPageIds])];
      setSelectedRows(newSelected);
    } else {
      const currentPageData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
      const currentPageIds = currentPageData.map(
        (row) => row["_id"] || row["id"],
      );
      const newSelected = selectedRows.filter(
        (id) => !currentPageIds.includes(id),
      );

      setSelectedRows(newSelected);
    }
  };

  const handleSelectRow = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter((rowId) => rowId !== id);
    }

    setSelectedRows(newSelected);
  };

  useEffect(() => {
    if (selectedRowss?.length === 0) {
      setInternalSelectedRows([]);
    }
  }, [selectedRowss]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedRows([]);
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(filterName.toLowerCase()),
    ),
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const notFound = !filteredData.length && !!filterName;
  const isEmpty = !filteredData.length && !filterName;

  const renderCellValue = (row: T, column: Column) => {
    if (column.renderCell) {
      return column.renderCell(row);
    }

    const value = row[column.id];

    if (column.id === "manager") {
      if (value == null || value === "") return tableEmptyUz.manager;
      return value;
    }

    if (column.format) {
      const formatted = column.format(value);
      if (
        formatted === null ||
        formatted === undefined ||
        formatted === "" ||
        (typeof formatted === "string" && formatted.trim() === "")
      ) {
        return tableEmptyUz.generic;
      }
      return formatted;
    }

    if (column.id === "birthDate") {
      if (value == null || value === "") return tableEmptyUz.contractDate;
      return String(value).split("T")[0];
    }

    if (value === null || value === undefined || value === "") {
      return tableEmptyUz.generic;
    }

    return value;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRows([]);
        onSelectedRowsChange?.([]);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onSelectedRowsChange]);

  return (
    <>
      <Scrollbar>
        <TableContainer sx={excelTableContainerStyle}>
          <Table
            aria-label="sticky table"
            size="small"
            stickyHeader
            sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                {columns
                  .filter((column) => selectedColumns.includes(column.id))
                  .map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "center"}
                      sx={
                        {
                          ...(excelHeaderCellStyle as object),
                          minWidth: column.minWidth || column.width || 100,
                          width: column.width ? `${column.width}px` : "auto",
                          ...(column.sticky ?
                            {
                              ...(column.sticky === "left" ?
                                (excelStickyLeftStyle(
                                  column.stickyOffset || 0,
                                ) as object)
                              : (excelStickyRightStyle(
                                  column.stickyOffset || 0,
                                ) as object)),
                              zIndex: 4,
                              backgroundColor: `${EXCEL_COLORS.headerBg} !important`,
                            }
                          : {}),
                        } as any
                      }>
                      {column.label}
                    </TableCell>
                  ))}
                {renderActions && (
                  <TableCell
                    align="center"
                    sx={
                      {
                        ...(excelHeaderCellStyle as object),
                        width: selectable ? "40px" : "60px",
                        minWidth: selectable ? "40px" : "60px",
                        px: "4px",
                        ...(selectable ?
                          {
                            ...(excelStickyRightStyle(32) as object),
                            zIndex: 4,
                            backgroundColor: `${EXCEL_COLORS.headerBg} !important`,
                          }
                        : {}),
                      } as any
                    }>
                    Actions
                  </TableCell>
                )}
                {selectable && (
                  <TableCell
                    padding="checkbox"
                    sx={
                      {
                        ...(excelHeaderCellStyle as object),
                        ...(excelStickyRightStyle(0) as object),
                        zIndex: 4,
                        width: "32px",
                        minWidth: "32px",
                      } as any
                    }>
                    <Checkbox
                      sx={{
                        ...excelCheckboxStyle,
                        color: "rgba(255,255,255,0.7)",
                        "&.Mui-checked": {
                          color: "var(--palette-common-white)",
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: "var(--palette-common-white)",
                        },
                      }}
                      indeterminate={(() => {
                        const currentPageData = filteredData.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        );
                        const currentPageIds = currentPageData.map(
                          (row) => row["_id"] || row["id"],
                        );
                        const selectedOnCurrentPage = currentPageIds.filter(
                          (id) => selectedRows.includes(id),
                        ).length;

                        return (
                          selectedOnCurrentPage > 0 &&
                          selectedOnCurrentPage < currentPageIds.length
                        );
                      })()}
                      checked={(() => {
                        const currentPageData = filteredData.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        );
                        const currentPageIds = currentPageData.map(
                          (row) => row["_id"] || row["id"],
                        );
                        const selectedOnCurrentPage = currentPageIds.filter(
                          (id) => selectedRows.includes(id),
                        ).length;

                        return (
                          currentPageData.length > 0 &&
                          selectedOnCurrentPage === currentPageIds.length
                        );
                      })()}
                      onChange={handleSelectAllRows}
                    />
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const rowId = row["_id"] || row["id"] || index.toString();
                  const isSelected = selectedRows.includes(rowId);

                  const isExpiredReminder =
                    row["isReminderNotification"] &&
                    row["date"] &&
                    new Date(row["date"]) < new Date();

                  return (
                    <TableRow
                      hover
                      key={rowId}
                      selected={isSelected}
                      sx={{
                        ...excelRowStyle,
                        cursor: onRowClick ? "pointer" : "default",
                        ...(row["isDeleted"] && {
                          backgroundColor:
                            "rgba(var(--palette-error-mainChannel) / 0.1) !important",
                          "&:hover": {
                            backgroundColor:
                              "rgba(var(--palette-error-mainChannel) / 0.2) !important",
                          },
                        }),
                        ...(isExpiredReminder && {
                          backgroundColor:
                            "rgba(var(--palette-error-mainChannel) / 0.08) !important",
                          "&:hover": {
                            backgroundColor:
                              "rgba(var(--palette-error-mainChannel) / 0.15) !important",
                          },
                        }),
                        ...(row["isReminderNotification"] &&
                          !isExpiredReminder && {
                            backgroundColor:
                              "rgba(var(--palette-warning-mainChannel) / 0.08) !important",
                            "&:hover": {
                              backgroundColor:
                                "rgba(var(--palette-warning-mainChannel) / 0.15) !important",
                            },
                          }),
                      }}>
                      {columns
                        .filter((column) => selectedColumns.includes(column.id))
                        .map((column) => (
                          <TableCell
                            key={`${rowId}-${column.id}`}
                            align={column.align || "center"}
                            onClick={() => onRowClick?.(row)}
                            sx={
                              {
                                ...(excelBodyCellStyle as object),
                                minWidth:
                                  column.minWidth || column.width || 100,
                                width:
                                  column.width ? `${column.width}px` : "auto",
                                ...(column.sticky ?
                                  {
                                    ...(column.sticky === "left" ?
                                      (excelStickyLeftStyle(
                                        column.stickyOffset || 0,
                                      ) as object)
                                    : (excelStickyRightStyle(
                                        column.stickyOffset || 0,
                                      ) as object)),
                                    zIndex: 1,
                                    ...(isExpiredReminder ?
                                      {
                                        backgroundColor:
                                          "rgba(var(--palette-error-mainChannel) / 0.08)",
                                      }
                                    : {}),
                                    ...((
                                      row["isReminderNotification"] &&
                                      !isExpiredReminder
                                    ) ?
                                      {
                                        backgroundColor:
                                          "rgba(var(--palette-warning-mainChannel) / 0.08)",
                                      }
                                    : {}),
                                  }
                                : {}),
                              } as any
                            }>
                            {renderCellValue(row, column)}
                          </TableCell>
                        ))}
                      {renderActions && (
                        <TableCell
                          align="center"
                          sx={
                            {
                              ...(excelBodyCellStyle as object),
                              width: selectable ? "40px" : "60px",
                              minWidth: selectable ? "40px" : "60px",
                              px: "4px",
                              ...(selectable ?
                                {
                                  ...(excelStickyRightStyle(32) as object),
                                  zIndex: 1,
                                }
                              : {}),
                            } as any
                          }>
                          {renderActions(row)}
                        </TableCell>
                      )}
                      {selectable && (
                        <TableCell
                          padding="checkbox"
                          sx={
                            {
                              ...(excelBodyCellStyle as object),
                              ...(excelStickyRightStyle(0) as object),
                              zIndex: 1,
                              width: "32px",
                              minWidth: "32px",
                              ...(isSelected ?
                                {
                                  backgroundColor:
                                    "rgba(var(--palette-primary-mainChannel) / 0.16)",
                                }
                              : {}),
                            } as any
                          }>
                          <Checkbox
                            sx={excelCheckboxStyle}
                            checked={isSelected}
                            onClick={(event) => handleSelectRow(event, rowId)}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={selectedColumns.length} />
                </TableRow>
              )}

              {notFound && (
                <TableNoData
                  columns={columns.length}
                  searchQuery={filterName}
                />
              )}
              {isEmpty && (
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
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={excelPaginationStyle}
      />
    </>
  );
}
