import type { PayloadAction } from "@reduxjs/toolkit";
import type { CurrencyDetails } from "@/types/cash";

import { createSlice } from "@reduxjs/toolkit";

interface IFinancial {
  totalContractPrice: number;
  initialPayment: number;
  paidAmount: number;
  remainingDebt: number;
}

export interface IStatistic {
  categories: string[];
  series: number[];
}

interface IDashboard {
  employees: number;
  customers: number;
  contracts: number;
  debtors: number;
  totalBalance: CurrencyDetails;
  financial: IFinancial;
}

export interface DashboardState {
  dashboard: IDashboard | null;
  statistic: {
    daily: IStatistic | null;
    monthly: IStatistic | null;
    yearly: IStatistic | null;
  };
  selectedGranularity: "daily" | "monthly" | "yearly";
  isLoading: boolean;
  isLoadingStatistic: boolean;
  currency: number;
}

const initialState: DashboardState = {
  dashboard: null,
  statistic: {
    daily: null,
    monthly: null,
    yearly: null,
  },
  selectedGranularity: "monthly",
  isLoading: false,
  isLoadingStatistic: false,
  currency: 0,
};

const dashbordSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<number>) {
      state.isLoading = false;
      state.isLoadingStatistic = false;
      state.currency = action.payload;
    },
    setDashboard(state, action: PayloadAction<IDashboard>) {
      state.isLoading = false;
      state.isLoadingStatistic = false;
      state.dashboard = action.payload;
    },
    setStatistic(
      state,
      action: PayloadAction<{
        granularity: "daily" | "monthly" | "yearly";
        data: IStatistic;
      }>,
    ) {
      state.statistic[action.payload.granularity] = action.payload.data;
      state.isLoadingStatistic = false;
    },
    setGranularity(
      state,
      action: PayloadAction<"daily" | "monthly" | "yearly">,
    ) {
      state.selectedGranularity = action.payload;
    },
    start(state) {
      state.isLoading = true;
      state.isLoadingStatistic = true;
    },
    success(state) {
      state.isLoading = false;
      state.isLoadingStatistic = false;
    },
    failure(state) {
      state.isLoading = false;
      state.isLoadingStatistic = false;
    },
  },
});

export const {
  start,
  failure,
  success,
  setCurrency,
  setDashboard,
  setStatistic,
  setGranularity,
} = dashbordSlice.actions;
export default dashbordSlice.reducer;
