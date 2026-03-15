import type { IProfile } from "@/types/admin";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  profile: IProfile;
  isLoading: boolean;
  isLoadingRefresh: boolean;
  loggedIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  profile: {
    firstname: "",
    lastname: "",
    phoneNumber: "",
    telegramId: "",
    role: null,
  },
  isLoading: false,
  isLoadingRefresh: false,
  loggedIn: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    refreshStart(state) {
      state.isLoadingRefresh = true;
      state.error = null;
    },
    refreshSuccess(
      state,
      action: PayloadAction<{
        profile: IProfile;
        accessToken?: string;
        token?: string;
      }>,
    ) {
      state.isLoadingRefresh = false;
      state.loggedIn = true;
      state.profile = action.payload.profile;
      state.error = null;
      console.log(
        "refreshSuccess - profile.role:",
        action.payload.profile.role,
      );

      const token = action.payload.accessToken || action.payload.token;
      if (token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(action.payload.profile),
        );
      }
    },
    refreshFailure(state, action: PayloadAction<string>) {
      state.isLoadingRefresh = false;
      state.error = action.payload;

      const token = localStorage.getItem("accessToken");
      const savedProfile = localStorage.getItem("userProfile");

      if (token && savedProfile) {
        state.loggedIn = true;
        try {
          const parsedProfile = JSON.parse(savedProfile);
          state.profile = parsedProfile;
        } catch (e) {
          state.loggedIn = false;
          state.profile = initialState.profile;
        }
      } else {
        state.loggedIn = false;
        state.profile = initialState.profile;
      }
    },

    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{
        profile: IProfile;
        accessToken?: string;
        token?: string;
      }>,
    ) {
      state.isLoading = false;
      state.loggedIn = true;
      state.profile = action.payload.profile;
      state.error = null;
      console.log("loginSuccess - profile.role:", action.payload.profile.role);

      const token = action.payload.accessToken || action.payload.token;
      if (token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(action.payload.profile),
        );
      }
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    logoutUser(state) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userProfile");

      state.loggedIn = false;
      state.isLoading = false;
      state.isLoadingRefresh = false;
      state.profile = initialState.profile;
      state.error = null;
    },
  },
});

export const {
  refreshStart,
  refreshSuccess,
  refreshFailure,

  loginStart,
  loginSuccess,
  logoutUser,
  loginFailure,
} = authSlice.actions;
export default authSlice.reducer;
