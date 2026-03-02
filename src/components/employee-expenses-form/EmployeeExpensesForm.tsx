/* eslint-disable @typescript-eslint/no-shadow */
import type { RootState, AppDispatch } from "@/store"

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Chip,
  Paper,
  Table,
  Stack,
  TableRow,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableFooter,
  TableContainer,
  TablePagination,
} from "@mui/material";

import { getExpenses } from "@/store/actions/employeeActions"

import ActionExpense from "@/sections/employee/action/action-expense"

export const EmployeeExpensesTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, expensesMeta, isLoadingExpenses, employeeId } = useSelector(
    (state: RootState) => state.employee
  );
  
  // ✅ Currency course olish (sum hisoblash uchun)
  const { currency } = useSelector((state: RootState) => state.dashboard);
  const exchangeRate = currency || 12500; // Default: 12,500

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (employeeId) {
      dispatch(getExpenses(employeeId, page + 1, limit));
    }
  }, [dispatch, employeeId, page, limit]);

  const renderSkeletonRows = (count = 10, columns = 6) =>
    Array.from({ length: count }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: columns }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" height={28} />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <TableContainer component={Paper} sx={{borderRadius:"18px"}}>
      <Typography variant="h6" p={2}>
        Xodimlar xarajatlari
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Miqdorlar</TableCell>
            <TableCell>Sana</TableCell>
            <TableCell>Holat</TableCell>
            <TableCell>Izoh</TableCell>
            <TableCell align="right">Amal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoadingExpenses
            ? renderSkeletonRows(10, 6)
            : expenses?.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {/* ✅ Dollar ko'rsatish */}
                      <Typography variant="body2">
                        DOLLAR: {exp.currencyDetails.dollar?.toLocaleString() || 0}
                      </Typography>
                      {/* ✅ Sum avtomatik hisoblash */}
                      <Typography variant="body2">
                        SUM: {((exp.currencyDetails.dollar || 0) * exchangeRate).toLocaleString()}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {new Date(exp.createdAt).toLocaleDateString("uz-UZ")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exp.isActive ? "Ochiq" : "Yopilgan"}
                      color={exp.isActive ? "warning" : "success"}
                    />
                  </TableCell>
                  <TableCell>{exp.notes}</TableCell>

                  <TableCell align="right">
                    {employeeId && exp.isActive && (
                      <ActionExpense
                        id={exp._id}
                        employeeId={employeeId}
                        page={page}
                        limit={limit}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={expensesMeta?.total || 0}
              page={page}
              rowsPerPage={limit}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
