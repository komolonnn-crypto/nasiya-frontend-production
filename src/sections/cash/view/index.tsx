import { CashView } from "./cash-view";
import ModalCash from "@/sections/cash/modal/modal-cash";
import ModalCashInfo from "@/sections/cash/modal/modal-cash-info";
import ModalCashReject from "@/sections/cash/modal/modal-cash-reject";

export function CashesView() {
  return (
    <>
      <CashView />
      <ModalCash />
      <ModalCashInfo />
      <ModalCashReject />
    </>
  );
}
