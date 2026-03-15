import type { RootState } from "@/store";
import type { TypedUseSelectorHook } from "react-redux";

import { useSelector } from "react-redux";

import { EmployeesView } from "./employees-view";
import EmployeeDetails from "./employee-details";
import ModalEmployees from "@/sections/employee/modal/modal-employee";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function EmployeessView() {
  const { employeeId } = useTypedSelector((state) => state.employee);

  return (
    <>
      {employeeId ?
        <EmployeeDetails />
      : <EmployeesView />}
      <ModalEmployees />
    </>
  );
}
