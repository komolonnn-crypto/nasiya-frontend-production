import { useMemo, useState } from "react";

import type { Column, SortConfig } from "@/components/table/types";

export function useTableLogic<T extends Record<string, any>>(
  data: T[],
  columns: Column[],
) {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((col) => col.id),
  );
  const [searchText, setSearchText] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [dateFilterFrom, setDateFilterFrom] = useState("");
  const [dateFilterTo, setDateFilterTo] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const filteredData = useMemo(() => {
    let result = [...data];
    const searchableFields = [
      "fullName",
      "manager",
      "phoneNumber",
      "customerName",
      "productName",
      "firstName",
      "lastName",
      "address",
      "passportSeries",
    ];

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        searchableFields.some((key) => {
          const value = item[key];
          if (
            key === "manager" &&
            typeof value === "object" &&
            value !== null
          ) {
            const managerName =
              `${value.firstName || ""} ${value.lastName || ""}`.toLowerCase();
            return managerName.includes(lowerSearch);
          }
          return value && value.toString().toLowerCase().includes(lowerSearch);
        }),
      );
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          const itemValue = item[key];

          if (typeof itemValue === "object" && itemValue !== null) {
            if (key === "manager") {
              const managerName =
                `${itemValue.firstName || ""} ${itemValue.lastName || ""}`.toLowerCase();
              return managerName.includes(value.toLowerCase());
            }
            return true;
          }

          if (typeof itemValue === "string") {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          if (typeof itemValue === "number") {
            return itemValue.toString().includes(value);
          }
          return true;
        });
      }
    });

    if (dateFilterFrom || dateFilterTo) {
      result = result.filter((item) => {
        const itemDate = item["createdAt"] || item["date"] || item["startDate"];
        if (!itemDate) return true;

        const itemDateObj = new Date(itemDate);
        if (dateFilterFrom) {
          const fromDate = new Date(dateFilterFrom);
          if (itemDateObj < fromDate) return false;
        }
        if (dateFilterTo) {
          const toDate = new Date(dateFilterTo);
          toDate.setHours(23, 59, 59, 999);
          if (itemDateObj > toDate) return false;
        }
        return true;
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        if (typeof aValue === "object" && aValue !== null) {
          if (sortConfig.key === "manager") {
            aValue = `${aValue.firstName || ""} ${aValue.lastName || ""}`;
            bValue = `${bValue?.firstName || ""} ${bValue?.lastName || ""}`;
          }
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    data,
    searchText,
    filterValues,
    dateFilterFrom,
    dateFilterTo,
    sortConfig,
  ]);

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId) ?
        prev.filter((id) => id !== columnId)
      : [...prev, columnId],
    );
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [columnId]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setSearchText("");
    setDateFilterFrom("");
    setDateFilterTo("");
    setSortConfig(null);
  };

  const handleDateFilterChange = (field: "from" | "to", value: string) => {
    if (field === "from") {
      setDateFilterFrom(value);
    } else {
      setDateFilterTo(value);
    }
  };

  return {
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
  };
}
