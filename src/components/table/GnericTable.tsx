import type { useTableLogic } from "@/hooks/useTableLogic";

import { Card } from "@mui/material";

import { TableSort } from "./TableSort";
import { TableComponent } from "./Table";
import { TableFilters } from "./TableFilters";
import { TableToolbar } from "./TableToolbar";
import { TableColumnSelector } from "./TableColumnSelector";
import { excelCardStyle } from "./excel-table-styles";

import type { Column } from "./types";

interface GenericTableProps<T extends Record<string, any>> {
  data: T[];
  selectable?: boolean;
  columns: Column[];
  renderActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  onCustomerClick?: (customer: any) => void;
  onNotesClick?: (row: T) => void;
  logic: ReturnType<typeof useTableLogic<T>>;
  setSelectedRows?: (selected: string[]) => void;
  selectedRows?: string[];
  component?: React.ReactNode;
  calendar?: React.ReactNode;
}

export function GenericTable<T extends Record<string, any>>({
  selectable = false,
  columns,
  renderActions,
  onRowClick,
  onCustomerClick,
  onNotesClick,
  logic,
  setSelectedRows,
  selectedRows,
  component,
  calendar,
}: GenericTableProps<T>) {
  const {
    filterAnchorEl,
    sortAnchorEl,
    columnAnchorEl,
    setFilterAnchorEl,
    setSortAnchorEl,
    setColumnAnchorEl,
    selectedColumns,
    searchText,
    setSearchText,
    filteredData,
    filterValues,
    dateFilterFrom,
    dateFilterTo,
    handleFilterChange,
    handleClearFilters,
    handleDateFilterChange,
    sortConfig,
    handleSort,
    handleColumnToggle,
  } = logic;

  return (
    <>
      <TableFilters
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        columns={columns}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={() => setFilterAnchorEl(null)}
        dateFilterFrom={dateFilterFrom}
        dateFilterTo={dateFilterTo}
        onDateFilterChange={handleDateFilterChange}
      />
      <TableSort
        anchorEl={sortAnchorEl}
        onClose={() => setSortAnchorEl(null)}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <TableColumnSelector
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        columns={columns}
        selectedColumns={selectedColumns}
        onColumnToggle={handleColumnToggle}
      />
      <Card
        sx={{
          ...excelCardStyle,
          overflow: "hidden",
          height: "100%",
          border: "none",
          borderRadius: "18px",
        }}>
        <TableToolbar
          onFilterClick={(e) => setFilterAnchorEl(e.currentTarget)}
          onSortClick={(e) => setSortAnchorEl(e.currentTarget)}
          onColumnClick={(e) => setColumnAnchorEl(e.currentTarget)}
          searchText={searchText}
          onSearchChange={setSearchText}
          component={component}
          calendar={calendar}
        />
        <TableComponent
          columns={columns}
          data={filteredData}
          selectedColumns={selectedColumns}
          {...(onRowClick && { onRowClick })}
          {...(onCustomerClick && { onCustomerClick })}
          {...(onNotesClick && { onNotesClick })}
          {...(renderActions && { renderActions })}
          {...(selectable && { selectable })}
          {...(setSelectedRows && { onSelectedRowsChange: setSelectedRows })}
          {...(selectedRows && { selectedRowss: selectedRows })}
        />
      </Card>
    </>
  );
}
