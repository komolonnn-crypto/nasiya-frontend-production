import authApi from "@/server/auth";

import { enqueueSnackbar } from "@/store/slices/snackbar";
import {
  start,
  success,
  failure,
  setDebtors,
  setDebtContract,
} from "@/store/slices/debtorSlice";

import type { AppThunk } from "@/store";

export const getDebtors = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/debtor/customers");
    const { data } = res;
    dispatch(setDebtors(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getDebtContract =
  (params?: { startDate: Date; endDate: Date }): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get("/debtor/contracts", {
        params: {
          startDate: params?.startDate?.toISOString(),
          endDate: params?.endDate?.toISOString(),
        },
      });
      const { data } = res;
      dispatch(setDebtContract(data));
    } catch (error: any) {
      dispatch(failure());
    }
  };

export const announceDebtors =
  (contractIds: string[]): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      await authApi.post("/debtor/announce", { contractIds });
      dispatch(success());
      dispatch(getDebtContract());
    } catch (err) {
      dispatch(failure());
    }
  };

export const updateDebCustomerManager =
  (customerId: string, managerId: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/customer/manager`, {
        customerId,
        managerId,
      });
      if (res.data.status === "ok") {
        dispatch(getDebtors());
        dispatch(getDebtContract());

        dispatch(
          enqueueSnackbar({
            message: res.data.message,
            options: { variant: "success" },
          }),
        );
      } else {
        dispatch(
          enqueueSnackbar({
            message: res.data.message,
            options: { variant: "success" },
          }),
        );
      }
    } catch (error: any) {
      dispatch(failure());
      const errorMessage =
        error.response?.data?.message || "tizimda xatolik ketdi";
      const errorMessages: string[] = error.response?.data?.errors || [];

      dispatch(
        enqueueSnackbar({
          message: errorMessage,
          options: { variant: "error" },
        }),
      );

      if (Array.isArray(errorMessages)) {
        errorMessages.forEach((err) => {
          dispatch(
            enqueueSnackbar({
              message: err,
              options: { variant: "error" },
            }),
          );
        });
      }
    }
  };
