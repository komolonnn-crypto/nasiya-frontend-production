import type { RootState } from "@/store";
import type { TypedUseSelectorHook } from "react-redux";

import { memo } from "react";
import { useSelector } from "react-redux";

import ContractsView from "./contract-view";
import ContractDetails from "./contract-detail";
import ModalContract from "@/sections/seller/contract/modal/modal-contract";
import ModalCustomer from "@/sections/seller/customer/modal/modal-customer";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const ContractView = () => {
  const { contractId } = useTypedSelector((state) => state.contract);

  return (
    <>
      {contractId ?
        <ContractDetails />
      : <ContractsView />}
      <ModalContract />
      <ModalCustomer show />
    </>
  );
};

export default memo(ContractView);
