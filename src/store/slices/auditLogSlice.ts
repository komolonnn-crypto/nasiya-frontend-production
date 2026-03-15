import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  fetchTodaySummary,
  fetchDailyActivity,
  fetchActivityStats,
  fetchFilteredActivity,
  fetchEntityHistory,
  fetchUserActivity,
  exportAuditLog,
} from "@/store/actions/auditLogActions";
import type { IAuditLog, AuditLogFilters } from "@/types/auditlog-page-types";

interface AuditLogState {
  todaySummary: {
    date: string;
    summary: {
      totalActivities: number;
      customers: {
        created: number;
        updated: number;
      };
      contracts: {
        created: number;
        updated: number;
      };
      payments: {
        total: number;
        confirmed: number;
        rejected: number;
      };
      excel_imports: number;
      users: {
        active: number;
        logins: number;
      };
    };
    recentActivities: IAuditLog[];
  } | null;

  dailyActivity: {
    date: string | null;
    activities: IAuditLog[];
    total: number;
    limit: number;
    page: number;
  } | null;

  activityStats: {
    period: {
      start: string;
      end: string;
    };
    stats: {
      _id: string;
      actions: {
        action: string;
        count: number;
      }[];
      totalCount: number;
    }[];
  } | null;

  filteredActivity: {
    activities: IAuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: AuditLogFilters;
  } | null;

  entityHistory: {
    entityType: string;
    entityId: string;
    history: IAuditLog[];
    total: number;
  } | null;

  userActivity: {
    userId: string;
    activity: IAuditLog[];
    total: number;
    limit: number;
  } | null;

  currentFilters: AuditLogFilters;

  loading: {
    todaySummary: boolean;
    dailyActivity: boolean;
    activityStats: boolean;
    filteredActivity: boolean;
    entityHistory: boolean;
    userActivity: boolean;
    export: boolean;
  };

  error: {
    todaySummary: string | null;
    dailyActivity: string | null;
    activityStats: string | null;
    filteredActivity: string | null;
    entityHistory: string | null;
    userActivity: string | null;
    export: string | null;
  };
}

const initialState: AuditLogState = {
  todaySummary: null,
  dailyActivity: null,
  activityStats: null,
  filteredActivity: null,
  entityHistory: null,
  userActivity: null,
  currentFilters: {
    limit: 50,
    page: 1,
  },
  loading: {
    todaySummary: false,
    dailyActivity: false,
    activityStats: false,
    filteredActivity: false,
    entityHistory: false,
    userActivity: false,
    export: false,
  },
  error: {
    todaySummary: null,
    dailyActivity: null,
    activityStats: null,
    filteredActivity: null,
    entityHistory: null,
    userActivity: null,
    export: null,
  },
};

const auditLogSlice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<AuditLogFilters>>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.currentFilters = {
        limit: 50,
        page: 1,
      };
    },

    clearErrors: (state) => {
      state.error = {
        todaySummary: null,
        dailyActivity: null,
        activityStats: null,
        filteredActivity: null,
        entityHistory: null,
        userActivity: null,
        export: null,
      };
    },

    changePage: (state, action: PayloadAction<number>) => {
      state.currentFilters.page = action.payload;
    },

    changePageSize: (state, action: PayloadAction<number>) => {
      state.currentFilters.limit = action.payload;
      state.currentFilters.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaySummary.pending, (state) => {
        state.loading.todaySummary = true;
        state.error.todaySummary = null;
      })
      .addCase(fetchTodaySummary.fulfilled, (state, action) => {
        state.loading.todaySummary = false;
        state.todaySummary = action.payload;
      })
      .addCase(fetchTodaySummary.rejected, (state, action) => {
        state.loading.todaySummary = false;
        state.error.todaySummary = action.payload as string;
      });

    builder
      .addCase(fetchDailyActivity.pending, (state) => {
        state.loading.dailyActivity = true;
        state.error.dailyActivity = null;
      })
      .addCase(fetchDailyActivity.fulfilled, (state, action) => {
        state.loading.dailyActivity = false;
        state.dailyActivity = action.payload;
      })
      .addCase(fetchDailyActivity.rejected, (state, action) => {
        state.loading.dailyActivity = false;
        state.error.dailyActivity = action.payload as string;
      });

    builder
      .addCase(fetchActivityStats.pending, (state) => {
        state.loading.activityStats = true;
        state.error.activityStats = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.loading.activityStats = false;
        state.activityStats = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.loading.activityStats = false;
        state.error.activityStats = action.payload as string;
      });

    builder
      .addCase(fetchFilteredActivity.pending, (state) => {
        state.loading.filteredActivity = true;
        state.error.filteredActivity = null;
      })
      .addCase(fetchFilteredActivity.fulfilled, (state, action) => {
        state.loading.filteredActivity = false;
        state.filteredActivity = action.payload;
      })
      .addCase(fetchFilteredActivity.rejected, (state, action) => {
        state.loading.filteredActivity = false;
        state.error.filteredActivity = action.payload as string;
      });

    builder
      .addCase(fetchEntityHistory.pending, (state) => {
        state.loading.entityHistory = true;
        state.error.entityHistory = null;
      })
      .addCase(fetchEntityHistory.fulfilled, (state, action) => {
        state.loading.entityHistory = false;
        state.entityHistory = action.payload;
      })
      .addCase(fetchEntityHistory.rejected, (state, action) => {
        state.loading.entityHistory = false;
        state.error.entityHistory = action.payload as string;
      });

    builder
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading.userActivity = true;
        state.error.userActivity = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading.userActivity = false;
        state.userActivity = action.payload;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading.userActivity = false;
        state.error.userActivity = action.payload as string;
      });

    builder
      .addCase(exportAuditLog.pending, (state) => {
        state.loading.export = true;
        state.error.export = null;
      })
      .addCase(exportAuditLog.fulfilled, (state) => {
        state.loading.export = false;
      })
      .addCase(exportAuditLog.rejected, (state, action) => {
        state.loading.export = false;
        state.error.export = action.payload as string;
      });
  },
});

export const {
  updateFilters,
  clearFilters,
  clearErrors,
  changePage,
  changePageSize,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;
