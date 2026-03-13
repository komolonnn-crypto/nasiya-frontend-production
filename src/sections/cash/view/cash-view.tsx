import { useRef, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  MdCheckCircle,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdCreditCard,
} from "react-icons/md";

import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Dialog,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Autocomplete,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  DialogContentText,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { setModal } from "@/store/slices/modalSlice";
import { DashboardContent } from "@/layouts/dashboard";
import { getManagers } from "@/store/actions/employeeActions";
import {
  getPendingPayments,
  confirmPayments,
} from "@/store/actions/cashActions";

import Loader from "@/components/loader/Loader";

import ChashTable from "./cashTable";
import { columnsCash } from "./column";
import ActionCash from "@/sections/cash/action/action-cash";
import NotesModal from "@/sections/cash/modal/modal-notes";

export function CashView() {
  const dispatch = useAppDispatch();
  const dataEmployee = useSelector((state: RootState) => state.employee);
  const { profile } = useSelector((state: RootState) => state.auth);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { isLoading, payments, error } = useSelector(
    (state: RootState) => state.cash,
  );

  const [manager, setManager] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const hasFetchedManager = useRef(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [customerInfoDialog, setCustomerInfoDialog] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });

  const [notesModal, setNotesModal] = useState<{
    open: boolean;
    payment: any;
  }>({
    open: false,
    payment: null,
  });

  const canConfirmPayments = profile.role !== "seller" && profile.role !== null;

  useEffect(() => {
    dispatch(getPendingPayments());
  }, [dispatch]);

  const handleCustomerFocus = useCallback(() => {
    dispatch(getManagers());
    hasFetchedManager.current = true;
  }, [dispatch]);

  const handleConfirmPayments = () => {
    dispatch(confirmPayments(selectedRows));
    setSelectedRows([]);
    setConfirmDialog(false);
  };

  const handleNotesClick = useCallback((payment: any) => {
    setNotesModal({
      open: true,
      payment,
    });
  }, []);

  const selectedPaymentsData = payments.filter((p: any) =>
    selectedRows.includes(p._id),
  );

  const totalAmount = selectedPaymentsData.reduce((sum: number, p: any) => {
    const actual =
      p.actualAmount !== undefined && p.actualAmount !== null ?
        p.actualAmount
      : p.amount;
    return sum + (actual || 0);
  }, 0);

  const handleCustomerClick = (customer: any) => {
    setCustomerInfoDialog({
      open: true,
      customer,
    });
  };

  const handleCloseCustomerDialog = () => {
    setCustomerInfoDialog({
      open: false,
      customer: null,
    });
  };

  const managerFullName =
    manager ? `${manager.firstName} ${manager.lastName}` : null;

  const pendingPayments = payments.filter(
    (payment: any) => payment.status === "PENDING" && !payment.isPaid,
  );

  const filteredCash =
    managerFullName ?
      pendingPayments.filter((payment: any) => {
        // ✅ Faqat managerId'dan filter qilish
        if (payment.managerId && typeof payment.managerId === "object") {
          const paymentManagerName =
            `${payment.managerId.firstName || ""} ${payment.managerId.lastName || ""}`.trim();
          return paymentManagerName === managerFullName;
        }
        return false;
      })
    : pendingPayments;

  const ManagerFilter = (
    <Autocomplete
      onFocus={handleCustomerFocus}
      options={dataEmployee.managers}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`} // ✅ combine names
      isOptionEqualToValue={(option, value) =>
        `${option.firstName} ${option.lastName}` ===
        `${value.firstName} ${value.lastName}`
      }
      loading={dataEmployee.isLoading}
      loadingText="Yuklanmoqda..."
      noOptionsText="Menejerlar topilmadi"
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Menejer bo'yicha filter"
          InputLabelProps={{
            ...params.InputLabelProps,
            className: params.InputLabelProps?.className ?? "",
            style: params.InputLabelProps?.style ?? {},
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {dataEmployee.isLoading ?
                  <CircularProgress color="inherit" size={20} />
                : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={(_event, value) => {
        setManager(value);
      }}
      value={manager}
      sx={{
        minWidth: { xs: 150, sm: 180, md: 200 },
        width: "100%",
        maxWidth: 400,
      }}
    />
  );

  if (payments.length === 0 && isLoading) {
    return <Loader />;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" flexGrow={1} sx={{ fontWeight: 600 }}>
            Kassa
          </Typography>
          {pendingPayments.length > 0 && (
            <Chip
              label={`${pendingPayments.length} ta kutilmoqda`}
              color="warning"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Bo'sh holat - pending to'lovlar yo'q */}
        {!isLoading && pendingPayments.length === 0 && (
          <Card
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "rgba(var(--palette-success-mainChannel) / 0.08)",
              border:
                "2px dashed rgba(var(--palette-success-mainChannel) / 0.4)",
            }}>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "center",
              }}>
              <Box
                sx={{
                  bgcolor: "success.main",
                  borderRadius: "50%",
                  p: 2,
                  display: "inline-flex",
                }}>
                <MdCheckCircle size={64} color="white" />
              </Box>
            </Box>
            <Typography
              variant="h5"
              gutterBottom
              fontWeight={600}
              color="success.main">
              Tasdiqlash uchun to&lsquo;lovlar yo&lsquo;q
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Barcha to&lsquo;lovlar tasdiqlangan yoki hozircha yangi
              to&lsquo;lovlar yo&lsquo;q
            </Typography>
          </Card>
        )}

        {/* Error message */}
        {error && (
          <Alert
            severity="error"
            onClose={() => dispatch({ type: "cash/setError", payload: null })}>
            {error}
          </Alert>
        )}

        {isLoading && payments.length > 0 && (
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            Yuklanmoqda...
          </Alert>
        )}

        {selectedRows.length > 0 && canConfirmPayments && (
          <Card
            sx={{
              p: 2.5,
              mb: 1,
              bgcolor: "rgba(var(--palette-success-mainChannel) / 0.12)",
              border:
                "2px solid rgba(var(--palette-success-mainChannel) / 0.5)",
              boxShadow: 2,
            }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    bgcolor: "success.main",
                    borderRadius: "50%",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <MdCheckCircle size={28} color="white" />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.dark">
                    {selectedRows.length} ta to&lsquo;lov tanlandi
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="success.main">
                    Jami: ${totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<MdCheckCircle />}
                onClick={() => setConfirmDialog(true)}
                sx={{
                  fontWeight: 600,
                  px: 3,
                  boxShadow: 3,
                }}>
                Tasdiqlash
              </Button>
            </Stack>
          </Card>
        )}

        {selectedRows.length > 0 && !canConfirmPayments && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Seller to&lsquo;lovlarni tasdiqlashi mumkin emas
          </Alert>
        )}

        <ChashTable
          data={filteredCash}
          columns={columnsCash}
          component={ManagerFilter}
          onRowClick={(row: any) => {
            dispatch(
              setModal({
                modal: "cashInfoModal",
                data: { type: "info", data: row },
              }),
            );
          }}
          onNotesClick={handleNotesClick}
          onCustomerClick={handleCustomerClick}
          selectable={canConfirmPayments}
          setSelectedRows={setSelectedRows}
          renderActions={(cash) => <ActionCash cash={cash} />}
        />
      </Stack>

      <Dialog
        open={customerInfoDialog.open}
        onClose={handleCloseCustomerDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdPerson size={24} color="var(--palette-primary-main)" />
          Mijoz ma'lumotlari
        </DialogTitle>
        <DialogContent>
          {customerInfoDialog.customer && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Avatar va ism */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main" }}>
                  {customerInfoDialog.customer.fullName?.charAt(0) || "M"}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {customerInfoDialog.customer.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {customerInfoDialog.customer._id?.slice(-8)}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <List dense>
                <ListItem>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mr: 2,
                    }}>
                    <MdPhone size={20} color="var(--palette-text-secondary)" />
                  </Box>
                  <ListItemText
                    primary="Telefon raqami"
                    secondary={customerInfoDialog.customer.phoneNumber || "—"}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mr: 2,
                    }}>
                    <MdLocationOn
                      size={20}
                      color="var(--palette-text-secondary)"
                    />
                  </Box>
                  <ListItemText
                    primary="Manzil"
                    secondary={customerInfoDialog.customer.address || "—"}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mr: 2,
                    }}>
                    <MdCreditCard
                      size={20}
                      color="var(--palette-text-secondary)"
                    />
                  </Box>
                  <ListItemText
                    primary="Passport seriyasi"
                    secondary={
                      customerInfoDialog.customer.passportSeries || "—"
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Tug'ilgan sana"
                    secondary={
                      customerInfoDialog.customer.birthDate ?
                        new Date(
                          customerInfoDialog.customer.birthDate,
                        ).toLocaleDateString("uz-UZ")
                      : "—"
                    }
                  />
                </ListItem>
                {customerInfoDialog.customer.manager && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Mas'ul menejer"
                        secondary={
                          (
                            typeof customerInfoDialog.customer.manager ===
                            "object"
                          ) ?
                            `${customerInfoDialog.customer.manager.firstName || ""} ${customerInfoDialog.customer.manager.lastName || ""}`
                          : "—"
                        }
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCustomerDialog} variant="outlined">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      <NotesModal
        open={notesModal.open}
        onClose={() => setNotesModal({ open: false, payment: null })}
        notes={
          notesModal.payment?.notes?.text ||
          notesModal.payment?.notes ||
          "Izoh yo'q"
        }
        customerName={
          notesModal.payment?.customerId ?
            notesModal.payment.customerId.fullName || ""
          : undefined
        }
        amount={notesModal.payment?.actualAmount || notesModal.payment?.amount}
      />

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdCheckCircle color="var(--palette-success-main)" size={24} />
          To&lsquo;lovlarni tasdiqlash
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRows.length} ta to&lsquo;lovni tasdiqlashni xohlaysizmi?
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 0 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tanlangan to&lsquo;lovlar soni:
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {selectedRows.length} ta
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Jami summa:
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="medium"
                  color="success.main">
                  ${totalAmount.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}>
            Tasdiqlangandan so&lsquo;ng to&lsquo;lovlar kassaga qabul qilinadi
            va shartnoma balansi yangilanadi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDialog(false)}
            color="inherit"
            variant="outlined">
            Bekor qilish
          </Button>
          <Button
            onClick={handleConfirmPayments}
            color="success"
            variant="contained"
            startIcon={<MdCheckCircle />}>
            Tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
