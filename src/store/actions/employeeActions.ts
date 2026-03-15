import type { CurrencyDetails } from "@/types/cash";
import type { IAddEmployee, IEditEmployee } from "@/types/employee";

import authApi from "@/server/auth";

import { enqueueSnackbar } from "@/store/slices/snackbar";
import {
  start,
  failure,
  success,
  setEmployee,
  setEmloyees,
  setManagers,
  setExpenses,
  startExpenses,
  failureExpenses,
} from "@/store/slices/employeeSlice";

import type { AppThunk } from "@/store";

export const getEmployees = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/employee/get-all");
    const { data } = res;
    dispatch(setEmloyees(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getEmployee =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get(`/employee/by-id/${id}`);
      const { data } = res;
      dispatch(setEmployee(data));
    } catch (error: any) {
      dispatch(failure());
    }
  };

export const getManagers = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/employee/manager");
    const { data } = res;
    dispatch(setManagers(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const addEmployee =
  (data: IAddEmployee): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post("/employee", data);
      dispatch(getEmployees());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
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

export const updateEmployee =
  (data: IEditEmployee): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put("/employee", data);
      dispatch(getEmployees());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
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

export const deleteEmployes =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.delete(`/employee/${id}`);
      dispatch(getEmployees());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
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

export const restorationEmployes =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/employee/restoration/${id}`);
      dispatch(getEmployees());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
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

export const getExpenses =
  (employeeId: string, page = 1, limit = 10): AppThunk =>
  async (dispatch) => {
    dispatch(startExpenses());
    try {
      const res = await authApi.get(
        `/expense/${employeeId}?page=${page}&limit=${limit}`,
      );
      dispatch(setExpenses(res.data));
    } catch (error: any) {
      dispatch(failureExpenses());
    }
  };

export const closeExpense =
  (expenseId: string, employeeId: string, page = 1, limit = 10): AppThunk =>
  async (dispatch) => {
    dispatch(startExpenses());
    try {
      await authApi.put("/expense/return", { id: expenseId });
      dispatch(getExpenses(employeeId, page, limit));
      dispatch(getEmployee(employeeId));
    } catch (error) {
      dispatch(failureExpenses());
    }
  };

export const withdrawFromBalance =
  (
    employeeId: string,
    currencyDetails: CurrencyDetails,
    notes?: string,
  ): AppThunk =>
  async (dispatch) => {
    try {
      await authApi.put("/employee/withdraw", {
        _id: employeeId,
        currencyDetails,
        notes: notes || "Balansdan pul yechib olindi",
      });

      dispatch(
        enqueueSnackbar({
          message: "Pul muvaffaqiyatli yechib olindi",
          options: { variant: "success" },
        }),
      );

      dispatch(getEmployee(employeeId));
      dispatch(getExpenses(employeeId, 1, 10));
    } catch (error: any) {
      console.error("Yechishda xatolik:", error);
      dispatch(
        enqueueSnackbar({
          message:
            error.response?.data?.message || "Pul yechishda xatolik yuz berdi",
          options: { variant: "error" },
        }),
      );
    }
  };
