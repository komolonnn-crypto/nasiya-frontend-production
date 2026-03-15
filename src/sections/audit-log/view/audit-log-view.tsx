import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  Box,
  Container,
  Typography,
  Stack,
  Alert,
  Button,
} from "@mui/material";

import type { AuditLogFilters as FilterType } from "@/types/auditlog-page-types";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Iconify } from "@/components/iconify";
import dayjs, { Dayjs } from "dayjs";

import {
  fetchDailyActivity,
  fetchActivityStats,
} from "@/store/actions/auditLogActions";

import AuditLogTable from "@/sections/audit-log/components/audit-log-table";
import AuditLogFilters from "@/sections/audit-log/components/audit-log-filters";

const STORAGE_KEY = "audit_log_filters";

export default function AuditLogView() {
  const dispatch = useAppDispatch();

  const { dailyActivity, loading, error } = useSelector(
    (state: RootState) => state.auditLog,
  );

  const [_activeTab, _setActiveTab] = useState<"logs" | "stats">("logs");
  const [_selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [filters, setFilters] = useState<FilterType>({ limit: 100, page: 1 });
  const [_limit, setLimit] = useState<number>(100);

  useEffect(() => {
    dispatch(fetchDailyActivity({ limit: 100, page: 1 }));

    const endDate = dayjs().format("YYYY-MM-DD");
    const startDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");
    dispatch(fetchActivityStats({ start: startDate, end: endDate }));
  }, [dispatch]);

  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    dispatch(fetchDailyActivity(updatedFilters));
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterType = { limit: 100, page: 1 };
    setFilters(clearedFilters);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    dispatch(fetchDailyActivity(clearedFilters));
  };

  useCallback(
    (newDate: Dayjs | null) => {
      if (newDate && newDate.isValid()) {
        setSelectedDate(newDate);
        const dateStr = newDate.format("YYYY-MM-DD");
        console.log("📅 Kalendar tanlandi:", {
          tanlangan: newDate.format("DD.MM.YYYY"),
          yuboriladi: dateStr,
          dayjs: newDate.toISOString(),
        });
        dispatch(
          fetchDailyActivity({
            date: dateStr,
            limit: 100,
          }),
        );
      }
    },
    [dispatch],
  );

  const handlePageChange = (_event: unknown, newPage: number) => {
    handleFiltersChange({ page: newPage + 1 });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    handleFiltersChange({ limit: newLimit, page: 1 });
  };

  const handleExport = () => {
    const csvData = dailyActivity?.activities || [];
    if (csvData.length === 0) {
      alert("Ma'lumot yo'q");
      return;
    }

    const headers = [
      "Sana",
      "Vaqt",
      "Xodim",
      "Harakat",
      "Entity",
      "Mijoz",
      "Summa",
    ];
    const rows = csvData.map((log) => [
      dayjs(log.timestamp).format("DD.MM.YYYY"),
      dayjs(log.timestamp).format("HH:mm"),
      `${log.userId.firstName} ${log.userId.lastName}`,
      log.action,
      log.entity,
      log.metadata?.customerName || "-",
      log.metadata?.amount ? `$${log.metadata.amount}` : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit-log-${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth={false}>
      {}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        mt={0}
        px={2}>
        <Typography variant="h4">Audit Log</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:download-fill" />}
          onClick={handleExport}
          {...((!dailyActivity?.activities ||
            dailyActivity.activities.length === 0) && { disabled: true })}>
          CSV Export
        </Button>
      </Stack>

      {}
      {Object.values(error).some(Boolean) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {Object.values(error).find(Boolean)}
        </Alert>
      )}

      {}
      <Box mb={2} px={2}>
        <AuditLogFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          loading={loading.dailyActivity}
        />
      </Box>

      {}
      <Box>
        <AuditLogTable
          data={dailyActivity?.activities || []}
          loading={loading.dailyActivity}
          title={`Barcha faoliyat`}
          subtitle={`Jami: ${dailyActivity?.total || 0} ta yozuv`}
          page={filters.page || 1}
          limit={filters.limit || 100}
          total={dailyActivity?.total || 0}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </Box>
    </Container>
  );
}
