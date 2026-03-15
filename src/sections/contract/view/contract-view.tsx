import React, { useRef, useState, useEffect } from "react";

import { useSelector } from "react-redux";
import {
  MdCheckCircle,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdCreditCard,
} from "react-icons/md";

import {
  Box,
  Tab,
  Tabs,
  Badge,
  Stack,
  Button,
  Dialog,
  Tooltip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

import ContractTable from "./contactTable";
import ActionContract from "@/sections/contract/action/action-contract";
import { columnsPageContract, columnsPageNewContract } from "./columns-fixed";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  approveContract,
  bulkDeleteContracts,
  getCompletedContracts,
  getContract,
  getContracts,
  getNewContracts,
} from "@/store/actions/contractActions";

import Loader from "@/components/loader/Loader";
import { DashboardContent } from "@/layouts/dashboard";
import { Iconify } from "@/components/iconify";
import { exportContractsToCSV } from "@/utils/export-csv";
import { setCustomer } from "@/store/slices/customerSlice";
import { setModal } from "@/store/slices/modalSlice";
import { setContractId } from "@/store/slices/contractSlice";
import type { RootState } from "@/store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export function ContractsView() {
  const dispatch = useAppDispatch();

  const { contracts, newContracts, completedContracts, isLoading } =
    useSelector((state: RootState) => state.contract);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const { profile } = useSelector((state: RootState) => state.auth);
  const isAdmin = profile?.role === "admin";

  const [tab, setTab] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    contractId: string | null;
    contractData: any;
  }>({
    open: false,
    contractId: null,
    contractData: null,
  });

  const [customerInfoDialog, setCustomerInfoDialog] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenConfirmDialog = (contract: any) => {
    setConfirmDialog({
      open: true,
      contractId: contract._id,
      contractData: contract,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      contractId: null,
      contractData: null,
    });
  };

  const handleConfirmContract = () => {
    if (confirmDialog.contractId) {
      dispatch(approveContract(confirmDialog.contractId));
      handleCloseConfirmDialog();
    }
  };

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

  const handleBulkDelete = () => {
    dispatch(bulkDeleteContracts(selectedRows));
    setBulkDeleteDialog(false);
    setSelectedRows([]);
  };

  useEffect(() => {
    dispatch(getContracts());
    dispatch(getNewContracts());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 2) {
      dispatch(getCompletedContracts());
    }
  }, [tab, dispatch]);

  if (contracts.length === 0 && isLoading) {
    return <Loader />;
  }

  return (
    <DashboardContent>
      <Stack spacing={1}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="end"
          gap={3}
          mb={2}>
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv"
            style={{ display: "none" }}
          />
          <Tooltip title="CSV formatda yuklab olish">
            <Button
              variant="outlined"
              color="success"
              startIcon={<Iconify icon="mingcute:download-2-line" />}
              onClick={() => {
                let dataToExport = contracts;
                if (tab === 1) dataToExport = newContracts;
                if (tab === 2) dataToExport = completedContracts;
                exportContractsToCSV(dataToExport);
              }}>
              Export CSV
            </Button>
          </Tooltip>
          <Tooltip title="Shartnoma qo'shish">
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                dispatch(setCustomer(null));
                dispatch(
                  setModal({
                    modal: "contractModal",
                    data: { type: "add", data: undefined },
                  }),
                );
              }}>
              Qo&apos;shish
            </Button>
          </Tooltip>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}>
            <Tab
              sx={{ minHeight: 48, py: 0, px: 3 }}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Faol shartnomalar
                  </Typography>
                </Box>
              }
              {...a11yProps(0)}
            />
            <Tab
              sx={{ minHeight: 48, py: 0, px: 3 }}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}>
                  <Badge
                    color="error"
                    badgeContent={newContracts.length}
                    sx={{
                      "& .MuiBadge-badge": {
                        top: 4,
                        right: -10,
                      },
                    }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Yangi shartnomalar
                    </Typography>
                  </Badge>
                </Box>
              }
              {...a11yProps(1)}
            />
            <Tab
              sx={{ minHeight: 48, py: 0, px: 3 }}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Tugatilgan
                  </Typography>
                </Box>
              }
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        {selectedRows.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            px={2}
            py={1}
            sx={{
              bgcolor: "rgba(var(--palette-error-mainChannel) / 0.12)",
              border: "1px solid rgba(var(--palette-error-mainChannel) / 0.24)",
              borderRadius: 1,
            }}>
            <Typography
              variant="body2"
              color="error.main"
              fontWeight={700}
              sx={{ flex: "1 1 auto" }}>
              {selectedRows.length} ta shartnoma tanlandi
            </Typography>
            <Box display="flex" gap={1} flexShrink={0}>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Iconify icon="mingcute:delete-2-line" />}
                onClick={() => setBulkDeleteDialog(true)}>
                O'chirish
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setSelectedRows([])}>
                Bekor qilish
              </Button>
            </Box>
          </Box>
        )}

        <CustomTabPanel value={tab} index={0}>
          <ContractTable
            data={contracts}
            columns={columnsPageContract}
            onRowClick={(row) => {
              dispatch(getContract(row._id));
              dispatch(setContractId(row._id));
            }}
            onCustomerClick={handleCustomerClick}
            renderActions={(contract) => <ActionContract contract={contract} />}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
          <ContractTable
            data={newContracts}
            columns={columnsPageNewContract}
            onRowClick={(row) => {
              dispatch(
                setModal({
                  modal: "contractModal",
                  data: { type: "edit", data: row },
                }),
              );
            }}
            onCustomerClick={handleCustomerClick}
            renderActions={(row) => (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfirmDialog(row);
                }}>
                Tasdiqlash
              </Button>
            )}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={2}>
          {completedContracts.length === 0 ?
            <Box width="100%" height="100px" display="flex" alignItems="center">
              <Loader />
            </Box>
          : <ContractTable
              data={completedContracts}
              columns={columnsPageContract}
              onRowClick={(row) => {
                dispatch(getContract(row._id));
                dispatch(setContractId(row._id));
              }}
              onCustomerClick={handleCustomerClick}
            />
          }
        </CustomTabPanel>
      </Stack>

      {}
      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ color: "error.main" }}>
          {selectedRows.length} ta shartnomani o'chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tanlangan <b>{selectedRows.length}</b> ta shartnoma bazadan{" "}
            <b>butunlay o'chiriladi</b>. Bu amalni qaytarib bo'lmaydi!
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBulkDeleteDialog(false)}
            variant="outlined"
            color="inherit">
            Bekor qilish
          </Button>
          <Button onClick={handleBulkDelete} variant="contained" color="error">
            Ha, o'chirilsin
          </Button>
        </DialogActions>
      </Dialog>

      {}
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
              {}
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

              {}
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

      {}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdCheckCircle color="var(--palette-success-main)" size={24} />
          Shartnomani tasdiqlash
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Shartnomani tasdiqlashni xohlaysizmi?
          </DialogContentText>
          {confirmDialog.contractData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 0 }}>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Mijoz:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.contractData.customer?.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Mahsulot:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.contractData.productName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Umumiy summa:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.contractData.totalPrice?.toLocaleString()}{" "}
                    so'm
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}>
            Tasdiqlangandan so'ng shartnoma faol bo'ladi va to'lov jadvali
            yaratiladi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseConfirmDialog}
            color="inherit"
            variant="outlined">
            Bekor qilish
          </Button>
          <Button
            onClick={handleConfirmContract}
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
