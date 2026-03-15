import type { ICustomer } from "@/types/customer";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  selectCustomer: ICustomer | null;
  selectCustomers: ICustomer[] | [];
  customers: ICustomer[] | [];
  newCustomers: ICustomer[];
  customerId: string | null;
  customer: ICustomer | null;
  isLoading: boolean;
}

const initialState: UserState = {
  selectCustomer: null,
  selectCustomers: [],
  customers: [],
  newCustomers: [],
  customerId: null,
  customer: null,
  isLoading: false,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setSelectCustomer(state, action: PayloadAction<ICustomer>) {
      state.isLoading = false;
      state.selectCustomer = action.payload;
    },
    setSelectCustomers(state, action: PayloadAction<ICustomer[] | []>) {
      state.isLoading = false;
      state.selectCustomers = action.payload;
    },
    setCustomers(state, action: PayloadAction<ICustomer[] | []>) {
      state.isLoading = false;
      state.customers = action.payload;
    },
    setNewCustomers(state, action: PayloadAction<ICustomer[] | []>) {
      state.isLoading = false;
      state.newCustomers = action.payload;
    },
    setCustomerId(state, action: PayloadAction<string | null>) {
      state.isLoading = false;
      state.customerId = action.payload;
    },
    setCustomer(state, action: PayloadAction<ICustomer | null>) {
      state.isLoading = false;
      state.customer = action.payload;
    },

    updateCustomersManager(
      state,
      action: PayloadAction<{ customerId: string; managerId: string }>,
    ) {
      const { customerId, managerId } = action.payload;

      state.isLoading = false;

      state.customers = state.customers.map((data) => {
        if (data._id === customerId) {
          return { ...data, managerId };
        }
        return data;
      });
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
  },
});

export const {
  setSelectCustomer,
  setSelectCustomers,
  setCustomers,
  setNewCustomers,
  setCustomerId,
  setCustomer,
  updateCustomersManager,
  start,
  success,
  failure,
} = customerSlice.actions;
export default customerSlice.reducer;
