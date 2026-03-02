import { lazy, Suspense, useEffect, useState } from "react";

import type { RootState } from "@/store"
import { TbPhoto } from "react-icons/tb";
import { useSelector } from "react-redux";
import { FaPassport } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  Stack,
  Paper,
  Table,
  Button,
  Dialog,
  TableRow,
  Skeleton,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  DialogContentText,
} from "@mui/material";
import { MdDelete, MdDownload } from "react-icons/md";

import { useAppDispatch } from "@/hooks/useAppDispatch"

import { DashboardContent } from "@/layouts/dashboard"
import { setCustomerId } from "@/store/slices/customerSlice"
import { getCustomer } from "@/store/actions/customerActions"

import { Iconify } from "@/components/iconify"
import Loader from "@/components/loader/Loader"
import CustomerInfo from "@/components/customer-infos/customerInfo"
import { EditHistoryTimeline } from "@/components/edit-history-timeline"

import Statistics from "./statistics";

const CustomerContract = lazy(() => import("./customer-contract"));

export function CustomerDetails() {
  const dispatch = useAppDispatch();
  const { customer, isLoading, customerId } = useSelector(
    (state: RootState) => state.customer
  );
  const allActiveContracts = customer?.contracts?.filter(
    (c) => c.isActive && c.status === "active"
  );

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: string;
    fileName: string | undefined;
  }>({
    open: false,
    type: "",
    fileName: "",
  });
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownloadFile = async (filePath: string, type: string) => {
    try {
      const filename = filePath.split("/").pop();
      if (!filename) return;

      const baseUrl =
        import.meta.env['VITE_API_BASE_URL'] || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${baseUrl}/api/file/download/${type}/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const openDeleteDialog = (type: string) => {
    const fileNames: Record<string, string> = {
      passport: "Passport",
      shartnoma: "Shartnoma",
      photo: "Foto",
    };

    setDeleteDialog({
      open: true,
      type,
      fileName: fileNames[type],
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      type: "",
      fileName: "",
    });
  };

  const confirmDeleteFile = async () => {
    if (!customerId || !deleteDialog.type || isDeleting) return;

    setIsDeleting(true);
    
    try {
      const baseUrl =
        import.meta.env['VITE_API_BASE_URL'] || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${baseUrl}/api/file/delete/${customerId}/${deleteDialog.type}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        closeDeleteDialog();
        // Refresh customer data after dialog close (non-blocking)
        setTimeout(() => {
          dispatch(getCustomer(customerId));
        }, 100);
      }
    } catch (error) {
      console.error("Delete file error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      dispatch(getCustomer(customerId));
    }
  }, [customerId, dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  if (customer == null) {
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
            onClick={() => dispatch(setCustomerId(null))}
            sx={{ borderRadius: "18px" }}
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
          onClick={() => dispatch(setCustomerId(null))}
          sx={{ borderRadius: "18px" }}
        >
          Ortga
        </Button>
      </Box>

      <Grid container spacing={3} my={2}>
        <Grid xs={12}>
          <Statistics 
            customer={customer} 
            {...(allActiveContracts && { contracts: allActiveContracts })} 
          />
        </Grid>
        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: "18px" }}>
            <CustomerInfo customer={customer} />
          </Paper>
        </Grid>
        <Grid xs={12} md={6} display="flex" flexDirection="column" gap={3}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: "18px" }}>
            <Typography mb={3} variant="h6">
              Yuklangan hujjatlar
            </Typography>
            <Stack direction="column" spacing={2}>
              {customer?.files?.passport ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <FaPassport size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Passport
                      {customer.files.passport.split(".").pop()
                        ? `.${customer.files.passport.split(".").pop()}`
                        : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(customer.files!.passport!, "passport")
                    }
                  >
                    <MdDownload />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog("passport")}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                  }}
                >
                  <FaPassport size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    ---
                  </Typography>
                </Box>
              )}

              {customer?.files?.shartnoma ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <FaRegFileLines size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Shartnoma
                      {customer.files.shartnoma.split(".").pop()
                        ? `.${customer.files.shartnoma.split(".").pop()}`
                        : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(
                        customer.files!.shartnoma!,
                        "shartnoma"
                      )
                    }
                  >
                    <MdDownload />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog("shartnoma")}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                  }}
                >
                  <FaRegFileLines size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    ---
                  </Typography>
                </Box>
              )}

              {customer?.files?.photo ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TbPhoto size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      Foto
                      {customer.files.photo.split(".").pop()
                        ? `.${customer.files.photo.split(".").pop()}`
                        : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      handleDownloadFile(customer.files!.photo!, "photo")
                    }
                  >
                    <MdDownload />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog("photo")}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "18px",
                  }}
                >
                  <TbPhoto size={20} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    ---
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
          <Paper elevation={3} sx={{ p: 2, borderRadius: "18px" }}>
            <Typography mb={3} variant="h6">
              Yaqinlashayotgan to‘lovlar
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "18px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sana</TableCell>
                    <TableCell align="right">Summa</TableCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {allActiveContracts
                    ?.filter((c) => c.nextPaymentDate)
                    .sort(
                      (a, b) =>
                        new Date(a.nextPaymentDate).getTime() -
                        new Date(b.nextPaymentDate).getTime()
                    )
                    .slice(0, 3)
                    .map((contract, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {contract.nextPaymentDate.split("T")[0]}
                        </TableCell>
                        <TableCell align="right">
                          {contract.monthlyPayment?.toLocaleString()} $
                        </TableCell>
                      </TableRow>
                    ))}
                </tbody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid xs={12}>
          <Suspense
            fallback={
              <Stack spacing={3}>
                <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "18px" }} />
                <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "18px" }} />
              </Stack>
            }
          >
            <CustomerContract
              {...(customer.contracts && { customerContracts: customer.contracts })}
              {...(customerId && { customerId })}
            />
          </Suspense>
        </Grid>

        {customer['editHistory'] && customer['editHistory'].length > 0 && (
          <Grid xs={12}>
            <EditHistoryTimeline
              history={customer['editHistory']}
              title="Mijoz Tahrirlash Tarixi"
            />
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: { borderRadius: "18px" }
        }}
      >
        <DialogTitle id="delete-dialog-title">Faylni o'chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.fileName} faylini o'chirmoqchimisiz? Bu amalni bekor
            qilib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={closeDeleteDialog} 
            color="inherit" 
            sx={{ borderRadius: "18px" }}
            {...(isDeleting && { disabled: true })}
          >
            Bekor qilish
          </Button>
          <Button 
            onClick={confirmDeleteFile} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: "18px" }}
            {...(isDeleting && { disabled: true })}
          >
            {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}