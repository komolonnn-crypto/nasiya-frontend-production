import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "@/server/api";

import type {
  AuditLogDailyResponse,
  AuditLogStatsResponse,
  AuditLogFilterResponse,
  AuditLogSummaryResponse,
  AuditLogFilters,
} from "@/types/auditlog-page-types";

export const fetchTodaySummary = createAsyncThunk(
  "auditLog/fetchTodaySummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AuditLogSummaryResponse>(
        "/audit/today-summary",
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Bugungi ma'lumotlarni olishda xatolik yuz berdi",
      );
    }
  },
);

export const fetchDailyActivity = createAsyncThunk(
  "auditLog/fetchDailyActivity",
  async (payload: string | AuditLogFilters, { rejectWithValue }) => {
    try {
      const params =
        typeof payload === "string" ? { date: payload } : payload || {};

      const cleanedParams = Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as any,
      );

      console.log("📡 API REQUEST: /audit/daily");
      console.log("📦 Params:", cleanedParams);
      console.log("🔑 employeeId:", cleanedParams.employeeId);

      const response = await api.get<AuditLogDailyResponse>("/audit/daily", {
        params: cleanedParams,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Kunlik ma'lumotlarni olishda xatolik yuz berdi",
      );
    }
  },
);

export const fetchActivityStats = createAsyncThunk(
  "auditLog/fetchActivityStats",
  async (params: { start?: string; end?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get<AuditLogStatsResponse>("/audit/stats", {
        params,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Statistika ma'lumotlarini olishda xatolik yuz berdi",
      );
    }
  },
);

export const fetchFilteredActivity = createAsyncThunk(
  "auditLog/fetchFilteredActivity",
  async (filters: AuditLogFilters, { rejectWithValue }) => {
    try {
      const cleanedFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as any,
      );

      const response = await api.get<AuditLogFilterResponse>("/audit/filter", {
        params: cleanedFilters,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Ma'lumotlarni filterlashda xatolik yuz berdi",
      );
    }
  },
);

export const fetchEntityHistory = createAsyncThunk(
  "auditLog/fetchEntityHistory",
  async (
    params: { entityType: string; entityId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        `/audit/entity/${params.entityType}/${params.entityId}`,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Entity history olishda xatolik yuz berdi",
      );
    }
  },
);

export const fetchUserActivity = createAsyncThunk(
  "auditLog/fetchUserActivity",
  async (params: { userId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = params.limit ? { limit: params.limit } : {};
      const response = await api.get(`/audit/user/${params.userId}`, {
        params: queryParams,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "User activity olishda xatolik yuz berdi",
      );
    }
  },
);

export const exportAuditLog = createAsyncThunk(
  "auditLog/exportAuditLog",
  async (filters: AuditLogFilters, { rejectWithValue, dispatch }) => {
    try {
      const exportFilters = { ...filters, limit: 10000, page: 1 };

      const result = await dispatch(fetchFilteredActivity(exportFilters));

      if (fetchFilteredActivity.fulfilled.match(result)) {
        return result.payload;
      } else {
        return rejectWithValue(
          "Export uchun ma'lumotlarni olish muvaffaqiyatsiz",
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Export qilishda xatolik yuz berdi",
      );
    }
  },
);
