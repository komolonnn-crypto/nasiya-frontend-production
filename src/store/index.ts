import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import cashReducer from "./slices/cashSlice";
import userReducer from "./slices/userSlice";
import modalReducer from "./slices/modalSlice";
import snackbarReducer from "./slices/snackbar";
import debtorReducer from "./slices/debtorSlice";
import employeeReducer from "./slices/employeeSlice";
import customerReducer from "./slices/customerSlice";
import contractReducer from "./slices/contractSlice";
import dashboardReducer from "./slices/dashboardSlice";
import auditLogReducer from "./slices/auditLogSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbars: snackbarReducer,

    employee: employeeReducer,
    customer: customerReducer,
    contract: contractReducer,
    debtor: debtorReducer,
    cash: cashReducer,
    dashboard: dashboardReducer,
    auditLog: auditLogReducer,

    user: userReducer,
    modal: modalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
