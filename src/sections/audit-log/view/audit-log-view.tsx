import type { RootState } from "@/store";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import { Iconify } from "@/components/iconify";
import dayjs, { Dayjs } from "dayjs";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useSelector } from "react-redux";

import {
  fetchDailyActivity,
  fetchActivityStats,
} from "@/store/actions/auditLogActions";

import AuditLogTable from "@/sections/audit-log/components/audit-log-table";
import AuditLogFilters from "@/sections/audit-log/components/audit-log-filters";
import type { AuditLogFilters as FilterType } from "@/types/audit-log";

// ----------------------------------------------------------------------

const STORAGE_KEY = "audit_log_filters";

// ✅ localStorage'dan filterlarni yuklash
const loadFiltersFromStorage = (): FilterType => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("📦 Saqlangan filterlar yuklandi:", parsed);

      // ✅ employeeId ni tozalash (API'dan yangi list kelganda tekshiriladi)
      // Agar localStorage'dagi employeeId API'da bo'lmasa, error chiqadi
      // Shuning uchun dastlab employeeId'ni olib tashlaymiz, keyin UI'da qayta tiklanadi
      const { employeeId, ...rest } = parsed;

      return rest;
    }
  } catch (error) {
    console.error("❌ Filterlarni yuklashda xato:", error);
  }
  // Default
  return {
    limit: 100,
    page: 1,
  };
};

export default function AuditLogView() {
  const dispatch = useAppDispatch();

  const { dailyActivity, loading, error } = useSelector(
    (state: RootState) => state.auditLog,
  );

  const [_activeTab, _setActiveTab] = useState<"logs" | "stats">("logs");
  const [_selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [filters, setFilters] = useState<FilterType>(loadFiltersFromStorage);
  const [_limit, setLimit] = useState<number>(filters.limit || 100);

  // Dastlabki yuklash
  useEffect(() => {
    console.log("🔄 Sahifa yuklandi, saqlangan filterlar:", filters);
    dispatch(fetchDailyActivity(filters));

    // Oxirgi 30 kun statistikasi
    const endDate = dayjs().format("YYYY-MM-DD");
    const startDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");
    dispatch(fetchActivityStats({ start: startDate, end: endDate }));
  }, [dispatch]); // filters'ni qo'shmaslik kerak - infinite loop

  // Filterlarni qo'llash
  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    console.log("🔍 FILTER APPLIED:", updatedFilters);
    console.log("📡 employeeId:", updatedFilters.employeeId);

    // ✅ localStorage'ga saqlash
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
      console.log("💾 Filterlar saqlandi:", updatedFilters);
    } catch (error) {
      console.error("❌ Filterlarni saqlashda xato:", error);
    }

    dispatch(fetchDailyActivity(updatedFilters));
  };

  // Filterlarni tozalash
  const handleClearFilters = () => {
    const clearedFilters: FilterType = { limit: 100, page: 1 };
    setFilters(clearedFilters);

    // ✅ localStorage'dan o'chirish
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Filterlar tozalandi");
    } catch (error) {
      console.error("❌ Filterlarni tozalashda xato:", error);
    }

    dispatch(fetchDailyActivity(clearedFilters));
  };

  // Sana o'zgarganida
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

  // Pagination handler
  const handlePageChange = (_event: unknown, newPage: number) => {
    handleFiltersChange({ page: newPage + 1 }); // MUI uses 0-based indexing
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    handleFiltersChange({ limit: newLimit, page: 1 });
  };

  // Export handler
  const handleExport = () => {
    // CSV export qilish
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
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        mt={0}
        px={2}
      >
        <Typography variant="h4">Audit Log</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:download-fill" />}
          onClick={handleExport}
          {...((!dailyActivity?.activities ||
            dailyActivity.activities.length === 0) && { disabled: true })}
        >
          CSV Export
        </Button>
      </Stack>

      {/* Error Alert */}
      {Object.values(error).some(Boolean) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {Object.values(error).find(Boolean)}
        </Alert>
      )}

      {/* Filterlar */}
      <Box mb={2} px={2}>
        <AuditLogFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          loading={loading.dailyActivity}
        />
      </Box>

      {/* Content */}
      <Box>
        <AuditLogTable
          data={dailyActivity?.activities || []}
          loading={loading.dailyActivity}
          title={`Barcha faoliyat`}
          subtitle={`Jami: ${dailyActivity?.total || 0} ta yozuv`}
          // Pagination props
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
