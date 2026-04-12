import type { RootState } from "@/store";

import { TbPhoto } from "react-icons/tb";
import { useSelector } from "react-redux";
import { FaPassport } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { useEffect } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  Stack,
  Paper,
  Button,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { MdDownload } from "react-icons/md";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import authApi from "@/server/auth";
import { setModal } from "@/store/slices/modalSlice";
import { DashboardContent } from "@/layouts/dashboard";
import {
  start,
  failure,
  success,
  setCustomerId,
  setCustomer,
} from "@/store/slices/customerSlice";

import { tableEmptyUz } from "@/utils/table-empty-labels";
import { Iconify } from "@/components/iconify";
import Loader from "@/components/loader/Loader";
import CustomerInfo from "@/components/customer-infos/customerInfo";

export function CustomerDetails() {
  const dispatch = useAppDispatch();
  const { customer, isLoading, customerId } = useSelector(
    (state: RootState) => state.customer,
  );

  const handleDownloadFile = async (filePath: string, type: string) => {
    try {
      const filename = filePath.split("/").pop();
      if (!filename) return;

      const baseUrl =
        import.meta.env["VITE_API_BASE_URL"] || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${baseUrl}/api/file/download/${type}/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  useEffect(() => {
    if (customerId) {
      const fetchCustomer = async () => {
        try {
          dispatch(start());
          const res = await authApi.get(
            `/seller/customer/get-one/${customerId}`,
          );
          dispatch(setCustomer(res.data));
          dispatch(success());
        } catch (error) {
          console.error("Error fetching customer:", error);
          dispatch(failure());
        }
      };
      fetchCustomer();
    } else {
      dispatch(setCustomer(null));
    }
  }, [customerId, dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  if (!customer) {
    return (
      <DashboardContent>
        <Box
          display="flex"
          alignItems="center"
          mb={5}
          justifyContent="space-between">
          <Button
            color="inherit"
            startIcon={<Iconify icon="weui:back-filled" />}
            onClick={() => dispatch(setCustomerId(null))}>
            Ortga
          </Button>
        </Box>
        <Typography variant="h4">Ma'lumot topilmadi</Typography>
      </DashboardContent>
    );
  }

  const allActiveContracts =
    customer?.contracts?.filter(
      (c: any) => c.isActive && c.status === "active",
    ) || [];

  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        mb={5}
        justifyContent="space-between">
        <Button
          color="inherit"
          startIcon={<Iconify icon="weui:back-filled" />}
          onClick={() => dispatch(setCustomerId(null))}>
          Ortga
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => {
            dispatch(
              setModal({
                modal: "customerModal",
                data: { type: "edit", data: customer },
              }),
            );
          }}>
          Tahrirlash
        </Button>
      </Box>

      <Grid container spacing={3} my={2}>
        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <CustomerInfo customer={customer} />
          </Paper>
        </Grid>
        <Grid xs={12} md={6} display="flex" flexDirection="column" gap={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography mb={3} variant="h6">
              Yuklangan hujjatlar
            </Typography>
            <Stack direction="column" spacing={2}>
              {customer?.files?.passport ?
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}>
                  <FaPassport size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Passport
                      {customer.files.passport.split(".").pop() ?
                        `.${customer.files.passport.split(".").pop()}`
                      : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(customer.files!.passport!, "passport")
                    }>
                    <MdDownload />
                  </IconButton>
                </Box>
              : <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                  }}>
                  <FaPassport size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {tableEmptyUz.fileMissing}
                  </Typography>
                </Box>
              }

              {customer?.files?.shartnoma ?
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}>
                  <FaRegFileLines size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Shartnoma
                      {customer.files.shartnoma.split(".").pop() ?
                        `.${customer.files.shartnoma.split(".").pop()}`
                      : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(
                        customer.files!.shartnoma!,
                        "shartnoma",
                      )
                    }>
                    <MdDownload />
                  </IconButton>
                </Box>
              : <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                  }}>
                  <FaRegFileLines size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {tableEmptyUz.fileMissing}
                  </Typography>
                </Box>
              }

              {customer?.files?.photo ?
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}>
                  <TbPhoto size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Foto
                      {customer.files.photo.split(".").pop() ?
                        `.${customer.files.photo.split(".").pop()}`
                      : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(customer.files!.photo!, "photo")
                    }>
                    <MdDownload />
                  </IconButton>
                </Box>
              : <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                  }}>
                  <TbPhoto size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {tableEmptyUz.fileMissing}
                  </Typography>
                </Box>
              }
            </Stack>
          </Paper>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography mb={3} variant="h6">
              Yaqinlashayotgan to'lovlar
            </Typography>
            {allActiveContracts && allActiveContracts.length > 0 ?
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sana</TableCell>
                      <TableCell align="right">Summa</TableCell>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {allActiveContracts
                      ?.filter((c: any) => c.nextPaymentDate)
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.nextPaymentDate).getTime() -
                          new Date(b.nextPaymentDate).getTime(),
                      )
                      .slice(0, 3)
                      .map((contract: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {contract.nextPaymentDate.split("T")[0]}
                          </TableCell>
                          <TableCell align="right">
                            {contract.monthlyPayment?.toLocaleString()} so'm
                          </TableCell>
                        </TableRow>
                      ))}
                  </tbody>
                </Table>
              </TableContainer>
            : <Typography color="text.secondary" variant="body2">
                Hozircha faol shartnomalar yo'q
              </Typography>
            }
          </Paper>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
