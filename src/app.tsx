import "@/global.css";

import { useEffect } from "react";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import Loader from "@/components/loader/Loader";
import Snackbar from "@/components/snackbar/Snanckbar";

import { refreshProfile } from "@/store/actions/authActions";
import type { RootState, AppDispatch } from "@/store";

import { Router } from "@/routes/sections";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function App() {
  useScrollToTop();
  const dispatch = useDispatch<AppDispatch>();

  const { isLoadingRefresh, loggedIn } = useTypedSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("userProfile");

    if (loggedIn) {
      return;
    }

    if (token) {
      dispatch(refreshProfile());
    }
  }, []);

  if (isLoadingRefresh) {
    return <Loader />;
  }

  return (
    <>
      <Router />
      <Snackbar />
    </>
  );
}
