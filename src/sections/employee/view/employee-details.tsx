import type { RootState } from "@/store"

import { useEffect } from "react";
import { useSelector } from "react-redux";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  Paper,
  Button,
  Typography,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch"

import { DashboardContent } from "@/layouts/dashboard"
import { setEmployeeId } from "@/store/slices/employeeSlice"
import { getEmployee } from "@/store/actions/employeeActions"
import { getCurrencyCourse } from "@/store/actions/dashboardActions"

import { Iconify } from "@/components/iconify"
import Loader from "@/components/loader/Loader"
import { Balance } from "@/components/balance-card/BalannceCard"
import EmployeeInfo from "@/components/employee-infos/employeeInfo"
import { EmployeeExpensesTable } from "@/components/employee-expenses-form/EmployeeExpensesForm"
import WithdrawAllBalanceCard from "@/components/with-draw-all-balance-card/WithDrawAll-Card-Modal"

const EmployeeDetails = () => {
  const dispatch = useAppDispatch();
  const { employee, employeeId, isLoading } = useSelector(
    (state: RootState) => state.employee
  );

  useEffect(() => {
    if (employeeId) {
      dispatch(getEmployee(employeeId));
      dispatch(getCurrencyCourse()); // Valyuta kursini yuklash
    }
  }, [employeeId, dispatch]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && employeeId) {
        dispatch(getEmployee(employeeId));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [employeeId, dispatch]);
  if (isLoading && employee == null) {
    return <Loader />;
  }
  if (employee == null) {
    return (
      <DashboardContent>
        <Box
          display="flex"
          alignItems="center"
          mb={5}
          justifyContent="space-between"
        >
          <Button
            color="inherit"
            startIcon={<Iconify icon="weui:back-filled" />}
            onClick={() => dispatch(setEmployeeId(null))}
          >
            Ortga
          </Button>
        </Box>
        <Typography variant="h4">No data</Typography>
      </DashboardContent>
    );
  }
  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        mb={5}
        justifyContent="space-between"
      >
        <Button
          color="inherit"
          startIcon={<Iconify icon="weui:back-filled" />}
          onClick={() => dispatch(setEmployeeId(null))}
        >
          Ortga
        </Button>
      </Box>
      <Grid container spacing={3} my={2} alignItems="stretch">
        <Grid xs={12}>
          <Balance employee={employee} />
        </Grid>

        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: "100%", borderRadius:"18px" }}>
            <EmployeeInfo employee={employee} />
          </Paper>
        </Grid>
        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" ,borderRadius:"18px"}}>
            <WithdrawAllBalanceCard employee={employee} />
          </Paper>
        </Grid>
        <Grid xs={12}>
          <EmployeeExpensesTable />
        </Grid>
      </Grid>
    </DashboardContent>
  );
};

export default EmployeeDetails;
