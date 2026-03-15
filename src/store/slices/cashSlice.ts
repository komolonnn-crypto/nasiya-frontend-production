import type { IPayment } from "@/types/cash";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface CashState {
  payments: IPayment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CashState = {
  payments: [],
  isLoading: false,
  error: null,
};

const cashSlice = createSlice({
  name: "cash",
  initialState,
  reducers: {
    setPayments(state, action: PayloadAction<IPayment[]>) {
      state.isLoading = false;
      state.payments = action.payload;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    start(state) {
      state.isLoading = true;
      state.error = null;
    },
    success(state) {
      state.isLoading = false;
      state.error = null;
    },
    failure(state, action: PayloadAction<string | undefined>) {
      state.isLoading = false;
      state.error = action.payload || "An error occurred";
    },
  },
});

export const { setPayments, setError, start, success, failure } =
  cashSlice.actions;
export default cashSlice.reducer;
