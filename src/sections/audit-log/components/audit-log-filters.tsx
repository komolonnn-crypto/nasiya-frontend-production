import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";

import dayjs, { Dayjs } from "dayjs";
import axiosInstance from "@/server/api";
import { Iconify } from "@/components/iconify";

import type {
  AuditLogFilters as FilterType,
  AuditAction,
  AuditEntity,
} from "@/types/auditlog-page-types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "@/types/auditlog-page-types";

interface Manager {
  _id: string;
  firstName: string;
  lastName: string;
}

interface AuditLogFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export default function AuditLogFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  loading,
}: AuditLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  const [_selectedDate, setSelectedDate] = useState<Dayjs | null>(
    filters.date ? dayjs(filters.date) : null,
  );
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const response = await axiosInstance.get("/employee/manager");

        let employees = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          employees = response.data.data;
        } else if (
          response.data.employees &&
          Array.isArray(response.data.employees)
        ) {
          employees = response.data.employees;
        } else if (Array.isArray(response.data)) {
          employees = response.data;
        }

        setManagers(employees);
      } catch (error) {
        setManagers([]);
      } finally {
        setLoadingManagers(false);
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
    setSelectedDate(filters.date ? dayjs(filters.date) : null);
  }, [filters]);

  const actionOptions = Object.entries(AUDIT_ACTION_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const entityOptions = Object.entries(AUDIT_ENTITY_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const handleFilterChange = (field: keyof FilterType, value: any) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 };
    setLocalFilters(newFilters);
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    const dateValue = newDate ? newDate.format("YYYY-MM-DD") : undefined;
    handleFilterChange("date", dateValue);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({ limit: 100, page: 1 });
    setSelectedDate(null);
    onClearFilters();
  };

  const activeFiltersCount = Object.entries(localFilters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !["limit", "page"].includes(key),
  ).length;

  return (
    <Card sx={{ boxShadow: 1, borderRadius: "18px" }}>
      <CardContent sx={{ py: 2, px: 3, "&:last-child": { pb: 2 }, my: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Qidiruv"
              placeholder="Mijoz yoki mahsulot nomi..."
              value={localFilters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Sana"
              type="date"
              value={localFilters.date || ""}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Iconify icon="eva:calendar-fill" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  opacity: 0,
                  position: "absolute",
                  right: 0,
                  width: "40px",
                  height: "100%",
                  cursor: "pointer",
                  zIndex: 1,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderRadius: "12px",
                  },
                  "& .MuiInputAdornment-root": {
                    pointerEvents: "none",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Harakat</InputLabel>
              <Select
                value={localFilters.action || ""}
                label="Harakat"
                onChange={(e) =>
                  handleFilterChange("action", e.target.value || undefined)
                }>
                <MenuItem value="">
                  <em>Hammasi</em>
                </MenuItem>
                {actionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Bo'lim</InputLabel>
              <Select
                value={localFilters.entity || ""}
                label="Bo'lim"
                onChange={(e) =>
                  handleFilterChange(
                    "entity",
                    (e.target.value as AuditEntity) || undefined,
                  )
                }>
                <MenuItem value="">
                  <em>Hammasi</em>
                </MenuItem>
                {entityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Xodim</InputLabel>
              <Select
                value={localFilters.employeeId || ""}
                label="Xodim"
                onChange={(e) =>
                  handleFilterChange("employeeId", e.target.value || undefined)
                }
                disabled={loadingManagers}>
                <MenuItem value="">
                  <em>Hammasi</em>
                </MenuItem>
                {loadingManagers ?
                  <MenuItem disabled>
                    <em>Yuklanmoqda...</em>
                  </MenuItem>
                : managers.length === 0 ?
                  <MenuItem disabled>
                    <em>Manager'lar topilmadi</em>
                  </MenuItem>
                : managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              {activeFiltersCount > 0 && (
                <Chip
                  size="small"
                  label={`${activeFiltersCount}`}
                  color="default"
                  variant="filled"
                  sx={{ borderRadius: "8px" }}
                />
              )}
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<Iconify icon="eva:refresh-outline" />}
                onClick={handleClearFilters}>
                Tozalash
              </Button>
              <Button
                variant="contained"
                size="small"
                color="inherit"
                sx={{
                  bgcolor: "gray.800",
                  "&:hover": { bgcolor: "gray.300" },
                }}
                startIcon={<Iconify icon="eva:search-fill" />}
                onClick={handleApplyFilters}
                {...(loading && { disabled: true })}>
                Qidirish
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {activeFiltersCount > 0 && (
          <Box mt={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {localFilters.date && (
                <Chip
                  size="small"
                  label={`Sana: ${dayjs(localFilters.date).format("DD.MM.YYYY")}`}
                  onDelete={() => {
                    setSelectedDate(null);
                    handleFilterChange("date", undefined);
                  }}
                  color="default"
                  variant="filled"
                  sx={{ borderRadius: "8px" }}
                />
              )}

              {localFilters.action && (
                <Chip
                  size="small"
                  label={`Harakat: ${AUDIT_ACTION_LABELS[localFilters.action as AuditAction]}`}
                  onDelete={() => handleFilterChange("action", undefined)}
                  color="default"
                  variant="filled"
                  sx={{ borderRadius: "8px" }}
                />
              )}

              {localFilters.entity && (
                <Chip
                  size="small"
                  label={`Bo'lim: ${AUDIT_ENTITY_LABELS[localFilters.entity as AuditEntity]}`}
                  onDelete={() => handleFilterChange("entity", undefined)}
                  color="default"
                  variant="filled"
                  sx={{ borderRadius: "8px" }}
                />
              )}

              {localFilters.search && (
                <Chip
                  size="small"
                  label={`Qidiruv: ${localFilters.search}`}
                  onDelete={() => handleFilterChange("search", undefined)}
                  color="default"
                  variant="filled"
                  sx={{ borderRadius: "8px" }}
                />
              )}

              {localFilters.employeeId &&
                (() => {
                  const employee =
                    Array.isArray(managers) ?
                      managers.find((m) => m._id === localFilters.employeeId)
                    : null;
                  return (
                    <Chip
                      size="small"
                      label={`Xodim: ${employee ? `${employee.firstName} ${employee.lastName}` : localFilters.employeeId}`}
                      onDelete={() =>
                        handleFilterChange("employeeId", undefined)
                      }
                      color="default"
                      variant="filled"
                      sx={{ borderRadius: "8px" }}
                    />
                  );
                })()}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
