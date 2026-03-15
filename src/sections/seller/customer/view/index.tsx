import { memo, useEffect } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store";
import type { TypedUseSelectorHook } from "react-redux";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setCustomer, setCustomerId } from "@/store/slices/customerSlice";

import CustomerView from "./customer-view";
import ModalCustomer from "@/sections/seller/customer/modal/modal-customer";
import { CustomerDetails } from "./customer-detail";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const CustomersView = () => {
  const dispatch = useAppDispatch();
  const { customerId } = useTypedSelector((state) => state.customer);

  useEffect(() => {
    if (!customerId) {
      dispatch(setCustomer(null));
    }

    return () => {
      dispatch(setCustomerId(null));
    };
  }, [customerId, dispatch]);

  return (
    <>
      {customerId ?
        <CustomerDetails />
      : <CustomerView />}
      <ModalCustomer />
    </>
  );
};

export default memo(CustomersView);
