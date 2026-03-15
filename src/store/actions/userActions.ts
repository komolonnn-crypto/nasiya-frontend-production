import type {
  IUserApproved,
  IUserAddCourse,
  IUserAddTutorial,
} from "@/types/user";

import authApi from "@/server/auth";

import {
  start,
  failure,
  setUsers,
  startApproved,
  failureApproved,
  successApproved,
} from "@/store/slices/userSlice";

import type { AppThunk } from "@/store";

export const getUsers = (): AppThunk => async (dispatch) => {
  dispatch(start());
  try {
    const res = await authApi.get("/user/get-all");
    const { data } = res;

    dispatch(setUsers(data));
  } catch (error: any) {
    dispatch(failure());
  }
};

export const approvedUser =
  (data: IUserApproved): AppThunk =>
  async (dispatch) => {
    dispatch(startApproved());
    try {
      await authApi.put("/user/approved-user/", data);
      dispatch(getUsers());
      dispatch(successApproved());
    } catch (error: any) {
      dispatch(failureApproved());
    }
  };

export const addUserCourse =
  (data: IUserAddCourse): AppThunk =>
  async (dispatch) => {
    try {
      await authApi.put("/user/add-user-course", data);
      dispatch(getUsers());
    } catch (error: any) {}
  };

export const addUserTutorial =
  (data: IUserAddTutorial): AppThunk =>
  async (dispatch) => {
    try {
      await authApi.put("/user/add-user-tutorial", data);
      dispatch(getUsers());
    } catch (error: any) {}
  };
