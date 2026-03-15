import { enqueueSnackbar } from "@/store/slices/snackbar";
import {
  loginStart,
  logoutUser,
  refreshStart,
  loginSuccess,
  loginFailure,
  refreshFailure,
  refreshSuccess,
} from "@/store/slices/authSlice";

import type { AppThunk } from "@/store";

import authApi from "@/server/auth";
import type { ILoginFormValues } from "@/types/login";
import axiosInstance from "@/server/api";

export const refreshProfile = (): AppThunk => async (dispatch) => {
  dispatch(refreshStart());

  try {
    const token = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("userProfile");

    if (token && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        dispatch(refreshSuccess({ profile, accessToken: token }));
        return;
      } catch (parseError) {}
    }

    const response = await authApi.get("/auth/refresh");

    dispatch(refreshSuccess(response.data));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;

    const token = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("userProfile");

    if (token && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        dispatch(refreshSuccess({ profile, accessToken: token }));
        return;
      } catch (parseError) {}
    }

    dispatch(refreshFailure(errorMessage));
  }
};

export const login =
  (data: ILoginFormValues): AppThunk =>
  async (dispatch) => {
    dispatch(loginStart());
    try {
      const response = await axiosInstance.post("/auth/login", data);

      dispatch(loginSuccess(response.data));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;

      dispatch(
        enqueueSnackbar({
          message: errorMessage,
          options: { variant: "error" },
        }),
      );
      dispatch(loginFailure(errorMessage));
    }
  };

export const logout = (): AppThunk => async (dispatch) => {
  try {
    await axiosInstance.get("/auth/logout");
    dispatch(logoutUser());
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;

    dispatch(loginFailure(errorMessage));
  }
};
