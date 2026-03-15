import type { IAddCustomer, IEditCustomer } from "@/types/customer";

import authApi from "@/server/auth";

import { enqueueSnackbar } from "@/store/slices/snackbar";
import {
  start,
  failure,
  success,
  setCustomer,
  setCustomers,
  setNewCustomers,
  setSelectCustomer,
  setSelectCustomers,
} from "@/store/slices/customerSlice";

import type { AppThunk } from "@/store";

export const getSelectCustomers = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get(`/customer/get-all-customer`);
    const { data } = res;
    dispatch(setSelectCustomers(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getCustomers = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get(`/customer/get-all`);
    const { data } = res;
    dispatch(setCustomers(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getNewCustomers = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/customer/get-new-all");
    const { data } = res;
    dispatch(setNewCustomers(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const getCustomer =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.get(`/customer/get-customer-by-id/${id}`);

      const { data } = res;
      dispatch(setCustomer(data));
    } catch (error: any) {
      dispatch(failure());
    }
  };

export const addCustomer =
  (data: IAddCustomer | FormData, show: boolean): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post("/customer", data, {
        headers: {
          "Content-Type":
            data instanceof FormData ?
              "multipart/form-data"
            : "application/json",
        },
      });
      dispatch(getCustomers());
      dispatch(getNewCustomers());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
      if (show) {
        dispatch(setSelectCustomer(res.data.customer));
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

export const updateCustomer =
  (data: IEditCustomer | FormData, id?: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put("/customer", data, {
        headers: {
          "Content-Type":
            data instanceof FormData ?
              "multipart/form-data"
            : "application/json",
        },
      });
      dispatch(getCustomers());
      dispatch(getNewCustomers());
      const customerId =
        id || (data instanceof FormData ? data.get("id") : data.id);
      if (customerId) {
        dispatch(getCustomer(customerId as string));
      }
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

export const deleteCustomer =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.delete(`/customer/${id}`);
      dispatch(getCustomers());
      dispatch(getNewCustomers());

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

export const restorationCustomer =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/customer/restoration/${id}`);
      dispatch(getCustomers());
      dispatch(getNewCustomers());

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

export const updateCustomerManager =
  (customerId: string, managerId: string): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/customer/manager`, {
        customerId,
        managerId,
      });
      if (res.data.status === "ok") {
        dispatch(getCustomers());

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

export const confirmationCustomer =
  ({
    customerId,
    managerId,
  }: {
    customerId: string;
    managerId: string;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/customer/confirmation`, {
        customerId,
        managerId,
      });
      if (res.data.status === "ok") {
        dispatch(getCustomer(customerId));

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

export const bulkDeleteCustomers =
  (customerIds: string[]): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.delete(`/customer/bulk-hard-delete`, {
        data: { customerIds },
      });

      dispatch(getCustomers());
      dispatch(getNewCustomers());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message:
            res.data.message || `${customerIds.length} ta mijoz o'chirildi`,
          options: { variant: "success" },
        }),
      );
    } catch (error: any) {
      dispatch(failure());
      const errorMessage =
        error.response?.data?.message || "Mijozlarni o'chirishda xatolik";
      dispatch(
        enqueueSnackbar({
          message: errorMessage,
          options: { variant: "error" },
        }),
      );
    }
  };

export const addCustomerSeller =
  (data: IAddCustomer | FormData, show: boolean): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.post("/customer/seller", data, {
        headers: {
          "Content-Type":
            data instanceof FormData ?
              "multipart/form-data"
            : "application/json",
        },
      });
      dispatch(getNewCustomers());
      dispatch(success());
      dispatch(
        enqueueSnackbar({
          message: res.data.message,
          options: { variant: "success" },
        }),
      );
      if (show) {
        dispatch(setSelectCustomer(res.data.customer));
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

export const updateCustomerSeller =
  (id: string, data: IEditCustomer | FormData): AppThunk =>
  async (dispatch) => {
    dispatch(start());
    try {
      const res = await authApi.put(`/seller/customer/${id}`, data, {
        headers: {
          "Content-Type":
            data instanceof FormData ?
              "multipart/form-data"
            : "application/json",
        },
      });
      const customerRes = await authApi.get(`/seller/customer/get-one/${id}`);
      dispatch(setCustomer(customerRes.data));
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
        error.response?.data?.message || "Tizimda xatolik ketdi";
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
