import type { IAddContract, IEditContract } from "@/types/contract";

import authApi from "@/server/auth";

import { enqueueSnackbar } from "@/store/slices/snackbar";
import { setCustomer } from "@/store/slices/customerSlice";
import {
  start,
  failure,
  success,
  setContract,
  setContracts,
  setNewContracts,
  setCompletedContracts,
} from "@/store/slices/contractSlice";

import type { AppThunk } from "@/store";

export const getContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/contract/get-all");
    const { data } = res;
    dispatch(setContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};
export const getCompletedContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/contract/get-all-completed");
    const { data } = res;
    dispatch(setCompletedContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getNewContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/contract/get-new-all");

    const { data } = res;
    dispatch(setNewContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getContract =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get(`/contract/get-contract-by-id/${id}`);

      const { data } = res;
      dispatch(setContract(data));
      dispatch(setCustomer(data.customer));
    } catch (error: any) {
      dispatch(failure());
    }
  };

export const addContract =
  (data: IAddContract): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post("/contract", data);
      dispatch(getContracts());
      dispatch(getNewContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      const errorMessages: string[] = error.response?.data?.errors;
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

export const updateContract =
  (data: IEditContract): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put("/contract", data);
      dispatch(getContract(data.id));
      dispatch(getContracts());
      dispatch(getNewContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      const errorMessages: string[] = error.response?.data?.errors;

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

export const getSellerActiveContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/seller/contract/active");
    const { data } = res;
    dispatch(setContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getSellerNewContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/seller/contract/new");
    const { data } = res;
    dispatch(setNewContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getSellerCompletedContracts = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/seller/contract/completed");
    const { data } = res;
    dispatch(setCompletedContracts(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getSellerContract =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get(`/seller/contract/${id}`);
      const { data } = res;
      dispatch(setContract(data));
      dispatch(setCustomer(data.customer));
    } catch (error: any) {
      dispatch(failure());
    }
  };

export const updateSellerContract =
  (data: IEditContract): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/seller/contract/${data.id}`, data);
      dispatch(getSellerContract(data.id));
      dispatch(getSellerActiveContracts());
      dispatch(getSellerNewContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      const errorMessages: string[] = error.response?.data?.errors;

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

export const addContractSeller =
  (data: IAddContract): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post("/seller/contract", data);
      dispatch(getSellerNewContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      const errorMessages: string[] = error.response?.data?.errors;

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

export const approveContract =
  (contractId: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post(`/contract/approve/${contractId}`);
      dispatch(getNewContracts());
      dispatch(getContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message || "Shartnoma tasdiqlandi",
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      dispatch(
        enqueueSnackbar({
          message: errorMessage || "Shartnomani tasdiqlashda xatolik",
          options: { variant: "error" },
        }),
      );
    }
  };

export const deleteContract =
  (contractId: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.delete(`/contract/hard-delete/${contractId}`);
      dispatch(getContracts());
      dispatch(getCompletedContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message || "Shartnoma o'chirildi",
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      dispatch(
        enqueueSnackbar({
          message: errorMessage || "Shartnomani o'chirishda xatolik",
          options: { variant: "error" },
        }),
      );
    }
  };

export const bulkDeleteContracts =
  (contractIds: string[]): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.delete(`/contract/bulk-hard-delete`, {
        data: { contractIds },
      });
      dispatch(getContracts());
      dispatch(getCompletedContracts());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message:
            res.data.message || `${contractIds.length} ta shartnoma o'chirildi`,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage = error.response?.data?.message;
      dispatch(
        enqueueSnackbar({
          message: errorMessage || "Shartnomalarni o'chirishda xatolik",
          options: { variant: "error" },
        }),
      );
    }
  };

export const updateContractManager =
  (customerId: string, managerId: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/customer/manager`, {
        customerId,
        managerId,
      });
      if (res.data.status === "ok") {
        dispatch(getContracts());
        dispatch(getNewContracts());
        dispatch(getCompletedContracts());

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
        error.response?.data?.message || "Menejer o'zgartirishda xatolik";
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
