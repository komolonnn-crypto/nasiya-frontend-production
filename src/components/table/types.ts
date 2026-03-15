export interface Column<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  width?: number;
  align?: "right" | "left" | "center";
  format?: (value: T) => string | React.ReactNode;
  renderCell?: (
    row: T,
    onCustomerClick?: (customer: any) => void,
    onNotesClick?: (row: T) => void,
  ) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  sticky?: "left" | "right";
  stickyOffset?: number;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

export interface TableData {
  [key: string]: any;
  _id: string;
}

export interface TableProps<T extends TableData> {
  columns: Column[];
  data: T[];
  selectedColumns?: string[];
  onRowClick?: (row: T) => void;
  noDataText?: string;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  filterValues?: Record<string, string>;
  onFilterChange?: (columnId: string, value: string) => void;
  onClearFilters?: () => void;
  sortConfig?: SortConfig<T> | null;
  onSort?: (key: string) => void;
  onColumnToggle?: (columnId: string) => void;
}
