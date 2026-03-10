import type { IMeta } from "@/types/meta";
import type { IExpense } from "@/types/expense";
import type { IEmployee } from "@/types/employee";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  employees: IEmployee[];
  employeeId: string | null;
  managers: IEmployee[];
  employee: IEmployee | null;
  expenses: IExpense[] | null;
  expensesMeta: IMeta | null;
  isLoading: boolean;
  isLoadingExpenses: boolean;
}

const initialState: UserState = {
  employees: [],
  managers: [],
  employeeId: null,
  employee: null,
  expenses: null,
  expensesMeta: null,
  isLoading: false,
  isLoadingExpenses: false,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmloyees(state, action: PayloadAction<IEmployee[] | []>) {
      state.isLoading = false;
      state.employees = action.payload;
    },
    setManagers(state, action: PayloadAction<IEmployee[] | []>) {
      state.isLoading = false;
      state.managers = action.payload;
    },
    setEmployeeId(state, action: PayloadAction<string | null>) {
      state.isLoading = false;
      state.employeeId = action.payload;
    },
    setEmployee(state, action: PayloadAction<IEmployee | null>) {
      state.isLoading = false;
      state.employee = action.payload;
    },
    setExpenses(
      state,
      action: PayloadAction<{ expenses: IExpense[]; meta: IMeta }>,
    ) {
      state.expenses = action.payload.expenses;
      state.expensesMeta = action.payload.meta;
      state.isLoadingExpenses = false;
    },

    start(state) {
      state.isLoading = true;
    },
    success(state) {
      state.isLoading = false;
    },

    failure(state) {
      state.isLoading = false;
    },
    startExpenses(state) {
      state.isLoadingExpenses = true;
    },
    successExpenses(state) {
      state.isLoadingExpenses = false;
    },

    failureExpenses(state) {
      state.isLoadingExpenses = false;
    },
  },
});

export const {
  start,
  success,
  failure,
  setEmloyees,
  setManagers,
  setEmployee,
  setExpenses,
  setEmployeeId,
  startExpenses,
  successExpenses,
  failureExpenses,
} = employeeSlice.actions;
export default employeeSlice.reducer;
