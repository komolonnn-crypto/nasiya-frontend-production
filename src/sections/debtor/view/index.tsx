import { useEffect } from "react";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { setCustomerId } from "@/store/slices/customerSlice";
import { getManagers } from "@/store/actions/employeeActions";

import { DebtorView } from "./debtor-view";

export function UsersView() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getManagers());

    return () => {
      dispatch(setCustomerId(null));
    };
  }, [dispatch]);

  return <DebtorView />;
}
