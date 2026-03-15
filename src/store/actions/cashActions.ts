import authApi from "@/server/auth";
import logger from "@/utils/logger";

import {
  start,
  success,
  setPayments,
  setError,
} from "@/store/slices/cashSlice";
import { enqueueSnackbar } from "@/store/slices/snackbar";

import type { AppThunk } from "@/store";
import type { IPayment } from "@/types/cash";

export const getPendingPayments = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/cash/pending");

    let payments: IPayment[] = [];

    if (res.data) {
      if (res.data.data && Array.isArray(res.data.data)) {
        payments = res.data.data;
      } else if (Array.isArray(res.data)) {
        payments = res.data;
      } else if (res.data.payments && Array.isArray(res.data.payments)) {
        payments = res.data.payments;
      } else {
        logger.warn("Unexpected response format:", res.data);
        payments = [];
      }
    }

    dispatch(setPayments(payments));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Xatolik yuz berdi";

    dispatch(setError(errorMessage));
    dispatch(
      enqueueSnackbar({
        message: `To'lovlarni yuklashda xatolik: ${errorMessage}`,
        options: { variant: "error" },
      }),
    );
  }
};

export const confirmPayments =
  (paymentIds: string[]): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      await authApi.post("/cash/confirm-payments", { paymentIds });

      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: "To'lovlar muvaffaqiyatli tasdiqlandi",
          options: { variant: "success" },
        }),
      );

      dispatch(getPendingPayments());
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Xatolik yuz berdi";

      dispatch(setError(errorMessage));
      dispatch(
        enqueueSnackbar({
          message: `To'lovlarni tasdiqlashda xatolik: ${errorMessage}`,
          options: { variant: "error" },
        }),
      );
    }
  };

export const rejectPayment =
  (paymentId: string, reason: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      await authApi.post("/cash/reject-payment", {
        paymentId,
        reason,
      });

      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: "To'lov muvaffaqiyatli rad etildi",
          options: { variant: "success" },
        }),
      );

      dispatch(getPendingPayments());
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Xatolik yuz berdi";

      dispatch(setError(errorMessage));
      dispatch(
        enqueueSnackbar({
          message: `To'lovni rad etishda xatolik: ${errorMessage}`,
          options: { variant: "error" },
        }),
      );
    }
  };
