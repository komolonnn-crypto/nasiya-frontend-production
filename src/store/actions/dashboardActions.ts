import authApi from "@/server/auth";

import { enqueueSnackbar } from "@/store/slices/snackbar";
import {
  start,
  failure,
  success,
  setCurrency,
  setDashboard,
  setStatistic,
} from "@/store/slices/dashboardSlice";

import type { AppThunk } from "@/store";
import type { IStatistic } from "@/store/slices/dashboardSlice";

export const getDashboard = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/dashboard");
    const { data } = res;
    dispatch(setDashboard(data.data));
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    dispatch(failure());
  }
};

export const getStatistic =
  (granularity: "daily" | "monthly" | "yearly"): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get(
        `/dashboard/statistic?range=${granularity}`,
      );
      const { data }: { data: IStatistic } = res;
      dispatch(setStatistic({ granularity, data }));
    } catch (error: any) {
      console.error("Statistic API error:", error);
      dispatch(failure());
    }
  };

export const getCurrencyCourse = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/dashboard/currency-course");
    const { data } = res;
    dispatch(setCurrency(data.course || 0));
    dispatch(success());
  } catch (error: any) {
    dispatch(failure());
  }
};

export const changeCurrency =
  (currency: number): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put("/dashboard/currency-course", { currency });
      dispatch(getCurrencyCourse());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message || "ok",
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message || "server xatoligi";
      const errorMessages: string[] = error.response?.data?.errors || [
        "server xatoligi",
      ];
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
