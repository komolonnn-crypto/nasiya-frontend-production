import type { RootState } from "@/store";
import type { IEmployee } from "@/types/employee";
import type { Column } from "@/components/table/types";

import { useEffect } from "react";
import { useSelector } from "react-redux";

import { Box, Stack, Button, Typography } from "@mui/material";

import { useTableLogic } from "@/hooks/useTableLogic";
import { useAppDispatch } from "@/hooks/useAppDispatch";

import { setModal } from "@/store/slices/modalSlice";
import { DashboardContent } from "@/layouts/dashboard";
import { getEmployees } from "@/store/actions/employeeActions";

import { setEmployeeId } from "@/store/slices/employeeSlice";

import { Iconify } from "@/components/iconify";
import Loader from "@/components/loader/Loader";
import { GenericTable } from "@/components/table/GnericTable";

import ActionEmployee from "@/sections/employee/action/action-meneger";

const columns: Column[] = [
  { id: "firstName", label: "Ism", sortable: true },
  { id: "lastName", label: "Familiya", sortable: true },
  { id: "phoneNumber", label: "Telefon raqami", sortable: true },
  { id: "role", label: "Role", sortable: true },
];

export function EmployeesView() {
  const dispatch = useAppDispatch();
  const { employees, isLoading } = useSelector(
    (state: RootState) => state.employee,
  );
  const logic = useTableLogic<IEmployee>(employees, columns);

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  if (employees.length === 0 && isLoading) {
    return <Loader />;
  }
  return (
    <DashboardContent>
      <Stack spacing={5}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              flexGrow: 1,
              color: (theme) =>
                theme.palette.mode === "dark" ? "grey.100" : "grey.900",
            }}>
            Xodimlar
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={
              <Iconify icon="mingcute:add-line" width={16} height={16} />
            }
            onClick={() => {
              dispatch(
                setModal({
                  modal: "employeeModal",
                  data: { type: "add", data: undefined },
                }),
              );
            }}>
            Qo&apos;shish
          </Button>
        </Box>

        <GenericTable
          data={employees}
          columns={columns}
          logic={logic}
          onRowClick={(row) => dispatch(setEmployeeId(row._id))}
          renderActions={(row) => <ActionEmployee employee={row} />}
        />
      </Stack>
    </DashboardContent>
  );
}
