
import { Box, Menu, Button, TextField, Typography } from "@mui/material";

import type { Column } from "./types";

interface TableFiltersProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  columns: Column[];
  filterValues: Record<string, string>;
  onFilterChange: (columnId: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  dateFilterFrom?: string;
  dateFilterTo?: string;
  onDateFilterChange?: (field: "from" | "to", value: string) => void;
}

export function TableFilters({
  anchorEl,
  onClose,
  columns,
  filterValues,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  dateFilterFrom = "",
  dateFilterTo = "",
  onDateFilterChange,
}: TableFiltersProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ p: 2, width: 350 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filterlar
        </Typography>
        {}
        <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
          Sana bo'yicha
        </Typography>
        <TextField
          fullWidth
          type="date"
          label="Boshlanish sanasi"
          value={dateFilterFrom}
          onChange={(e) => onDateFilterChange?.("from", e.target.value)}
          margin="normal"
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          type="date"
          label="Tugash sanasi"
          value={dateFilterTo}
          onChange={(e) => onDateFilterChange?.("to", e.target.value)}
          margin="normal"
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        {}
        <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
          Ustun bo'yicha
        </Typography>
        {columns
          .filter((column) => column.filterable !== false)
          .map((column) => (
            <TextField
              key={column.id}
              label={column.label}
              value={filterValues[column.id] || ""}
              onChange={(e) => onFilterChange(column.id, e.target.value)}
              fullWidth
              margin="normal"
              size="small"
            />
          ))}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button variant="outlined" onClick={onClearFilters}>
            Tozalash
          </Button>
          <Button variant="contained" onClick={onApplyFilters}>
            Qo&apos;llash
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}
