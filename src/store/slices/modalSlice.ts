import type { IPayment } from "@/types/cash";
import type { IDebt } from "@/types/debtor";
import type { IMeneger } from "@/types/meneger";
import type { IEmployee } from "@/types/employee";
import type { ICustomer } from "@/types/customer";
import type { IContract } from "@/types/contract";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

type ModalType = "add" | "edit" | "info" | "reject" | undefined;

type ModalData<T> = {
  type: ModalType;
  data: T | undefined;
};

export interface ModalState {
  employeeModal: ModalData<IEmployee>;
  customerModal: ModalData<ICustomer>;

  contractModal: ModalData<IContract>;

  debtorModal: ModalData<IDebt>;

  cashModal: ModalData<IPayment>;
  cashInfoModal: ModalData<IPayment>;
  cashRejectModal: ModalData<IPayment>;
  menegerModal: ModalData<IMeneger>;
  dashboardModal: ModalData<number>;
}

export const initialState: ModalState = {
  employeeModal: { type: undefined, data: undefined },
  customerModal: { type: undefined, data: undefined },

  contractModal: { type: undefined, data: undefined },
  debtorModal: { type: undefined, data: undefined },
  cashModal: { type: undefined, data: undefined },
  cashInfoModal: { type: undefined, data: undefined },
  cashRejectModal: { type: undefined, data: undefined },
  menegerModal: { type: undefined, data: undefined },
  dashboardModal: { type: undefined, data: undefined },
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal<T>(
      state: ModalState,
      action: PayloadAction<{ modal: keyof ModalState; data: ModalData<T> }>,
    ) {
      const { modal, data } = action.payload;
      (state[modal] as ModalData<T>) = data;
    },
    closeModal(state, action: PayloadAction<keyof ModalState>) {
      const modal = action.payload;
      Object.assign(state[modal], {
        type: undefined,
        data: undefined,
      });
    },
  },
});

export const { setModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
