import type { IUser } from "@/types/user";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  users: IUser[];
  user: IUser | null;
  isLoadingApproved: boolean;
  isLoadingGetCourse: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  users: [],
  user: null,
  isLoadingApproved: false,
  isLoadingGetCourse: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<IUser[] | []>) {
      state.isLoading = false;
      state.users = action.payload;
    },
    setUserData(state, action: PayloadAction<IUser | null>) {
      state.isLoading = false;
      state.user = action.payload;
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
    startApproved(state) {
      state.isLoadingApproved = true;
    },
    successApproved(state) {
      state.isLoadingApproved = false;
    },
    failureApproved(state) {
      state.isLoadingApproved = false;
    },
    startGetCourse(state) {
      state.isLoadingGetCourse = true;
    },
    successGetCourse(state) {
      state.isLoadingGetCourse = false;
    },
    failureGetCourse(state) {
      state.isLoadingGetCourse = false;
    },
  },
});

export const {
  setUsers,
  setUserData,
  start,
  success,
  failure,
  startApproved,
  successApproved,
  failureApproved,
  startGetCourse,
  successGetCourse,
  failureGetCourse,
} = userSlice.actions;
export default userSlice.reducer;
