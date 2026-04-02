import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { MdCheckCircle, MdPerson } from "react-icons/md";

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
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

import ContractTable from "./contactTable";
import ActionContract from "@/sections/contract/action/action-contract";
import {
  createColumnsPageContract,
  createColumnsPageNewContract,
} from "./columns-fixed";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  approveContract,
  bulkDeleteContracts,
  getCompletedContracts,
  getContract,
  getContracts,
  getNewContracts,
  updateContractManager,
} from "@/store/actions/contractActions";
import { getManagers } from "@/store/actions/employeeActions";

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
  const dataEmployee = useSelector((state: RootState) => state.employee);
  const { contracts, newContracts, completedContracts, isLoading } =
    useSelector((state: RootState) => state.contract);
  const { profile } = useSelector((state: RootState) => state.auth);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [tab, setTab] = useState(0);
  const [manager, setManager] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const isAdmin = profile?.role === "admin";
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    contractId: string | null;
    contractData: any;
  }>({ open: false, contractId: null, contractData: null });

  const [customerInfoDialog, setCustomerInfoDialog] = useState<{
    open: boolean;
    customer: any;
  }>({ open: false, customer: null });

  // --- Manager Filter Logic ---
  const handleManagerFocus = useCallback(() => {
    dispatch(getManagers());
  }, [dispatch]);

  const handleManagerChange = useCallback(
    (customerId: string, newManager: string) => {
      dispatch(updateContractManager(customerId, newManager));
    },
    [dispatch],
  );

  const managerFullName =
    manager ? `${manager.firstName} ${manager.lastName}` : null;

  const filterListByManager = useCallback(
    (list: any[]) => {
      if (!managerFullName) return list;
      console.log("🔍 Filter Debug:", {
        managerFullName,
        listLength: list.length,
        firstItem: list[0],
        firstItemManager: list[0]?.manager,
      });
      return list.filter((item) => {
        const m = item.managerId || item.manager;
        if (m && typeof m === "object") {
          const name = `${m.firstName || ""} ${m.lastName || ""}`.trim();
          return name === managerFullName;
        }
        // If manager is a string, compare directly (like debtors)
        return m === managerFullName;
      });
    },
    [managerFullName],
  );

  const filteredContracts = useMemo(
    () => filterListByManager(contracts),
    [contracts, filterListByManager],
  );
  const filteredNewContracts = useMemo(
    () => filterListByManager(newContracts),
    [newContracts, filterListByManager],
  );
  const filteredCompletedContracts = useMemo(
    () => filterListByManager(completedContracts),
    [completedContracts, filterListByManager],
  );

  const ManagerFilter = (
    <Autocomplete
      onFocus={handleManagerFocus}
      options={dataEmployee.managers}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
      isOptionEqualToValue={(option, value) =>
        `${option.firstName} ${option.lastName}` ===
        `${value.firstName} ${value.lastName}`
      }
      loading={dataEmployee.isLoading}
      renderInput={(params) => (
        <TextField
          {...(params as any)} // Bypasses the strict optional check
          label="Menejer bo'yicha filter"
          size="small"
          InputProps={{
            ...(params.InputProps as any),
            endAdornment: (
              <>
                {dataEmployee.isLoading && (
                  <CircularProgress color="inherit" size={20} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={(_event, value) => setManager(value)}
      value={manager}
      sx={{ minWidth: 200, maxWidth: 350, width: "100%" }}
    />
  );

  // --- Handlers ---
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOpenConfirmDialog = (contract: any) => {
    setConfirmDialog({
      open: true,
      contractId: contract._id,
      contractData: contract,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, contractId: null, contractData: null });
  };

  const handleConfirmContract = () => {
    if (confirmDialog.contractId) {
      dispatch(approveContract(confirmDialog.contractId));
      handleCloseConfirmDialog();
    }
  };

  const handleCustomerClick = (customer: any) => {
    setCustomerInfoDialog({ open: true, customer });
  };

  const handleBulkDelete = () => {
    dispatch(bulkDeleteContracts(selectedRows));
    setBulkDeleteDialog(false);
    setSelectedRows([]);
  };

  useEffect(() => {
    dispatch(getContracts());
    dispatch(getNewContracts());
    dispatch(getManagers());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 2) dispatch(getCompletedContracts());
  }, [tab, dispatch]);

  // ✅ Tab o'zgarganda selectedRows ni tozalash
  useEffect(() => {
    setSelectedRows([]);
  }, [tab]);

  // ✅ Manager filtri o'zgarganda selectedRows ni tozalash
  useEffect(() => {
    setSelectedRows([]);
  }, [manager]);

  if (contracts.length === 0 && isLoading) return <Loader />;

  return (
    <DashboardContent>
      <Stack spacing={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}>
          <Box sx={{ flexGrow: 1 }}></Box>

          <Stack direction="row" spacing={2}>
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
          </Stack>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto">
            <Tab
              label={
                <Typography variant="subtitle2" fontWeight={700}>
                  Faol
                </Typography>
              }
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Badge
                  color="error"
                  badgeContent={newContracts.length}
                  sx={{ "& .MuiBadge-badge": { top: 4, right: -10 } }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Yangi
                  </Typography>
                </Badge>
              }
              {...a11yProps(1)}
            />
            <Tab
              label={
                <Typography variant="subtitle2" fontWeight={700}>
                  Tugatilgan
                </Typography>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        {selectedRows.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            px={2}
            py={1}
            sx={{
              bgcolor: "error.lighter",
              border: "1px solid",
              borderColor: "error.light",
              borderRadius: 1,
            }}>
            <Typography
              variant="body2"
              color="error.main"
              fontWeight={700}
              sx={{ flex: "1 1 auto" }}>
              {selectedRows.length} ta shartnoma tanlandi
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
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
        )}

        <CustomTabPanel value={tab} index={0}>
          <ContractTable
            data={filteredContracts}
            columns={createColumnsPageContract(handleManagerChange)}
            component={ManagerFilter}
            onRowClick={(row) => {
              dispatch(getContract(row._id));
              dispatch(setContractId(row._id));
            }}
            onCustomerClick={handleCustomerClick}
            renderActions={(contract) => <ActionContract contract={contract} />}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
            selectedRows={selectedRows}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={1}>
          <ContractTable
            data={filteredNewContracts}
            columns={createColumnsPageNewContract(handleManagerChange)}
            component={ManagerFilter}
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
            selectedRows={selectedRows}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={2}>
          {filteredCompletedContracts.length === 0 && isLoading ?
            <Box width="100%" display="flex" justifyContent="center" py={5}>
              <Loader />
            </Box>
          : <ContractTable
              data={filteredCompletedContracts}
              columns={createColumnsPageContract(handleManagerChange)}
              component={ManagerFilter}
              onRowClick={(row) => {
                dispatch(getContract(row._id));
                dispatch(setContractId(row._id));
              }}
              onCustomerClick={handleCustomerClick}
            />
          }
        </CustomTabPanel>
      </Stack>

      {/* --- Dialogs --- */}
      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ color: "error.main" }}>
          O'chirishni tasdiqlang
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tanlangan <b>{selectedRows.length}</b> ta shartnoma butunlay
            o'chiriladi.
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

      <Dialog
        open={customerInfoDialog.open}
        onClose={() => setCustomerInfoDialog({ open: false, customer: null })}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdPerson size={24} color="var(--palette-primary-main)" /> Mijoz
          ma'lumotlari
        </DialogTitle>
        <DialogContent>
          {customerInfoDialog.customer && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main" }}>
                  {customerInfoDialog.customer.fullName?.charAt(0)}
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
                  <ListItemText
                    primary="Telefon"
                    secondary={customerInfoDialog.customer.phoneNumber || "—"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Manzil"
                    secondary={customerInfoDialog.customer.address || "—"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Passport"
                    secondary={
                      customerInfoDialog.customer.passportSeries || "—"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tug'ilgan sana"
                    secondary={
                      customerInfoDialog.customer.birthDate ?
                        new Date(
                          customerInfoDialog.customer.birthDate,
                        ).toLocaleDateString()
                      : "—"
                    }
                  />
                </ListItem>
              </List>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setCustomerInfoDialog({ open: false, customer: null })
            }
            variant="outlined">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdCheckCircle color="var(--palette-success-main)" size={24} />{" "}
          Shartnomani tasdiqlash
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Shartnomani tasdiqlashni xohlaysizmi?
          </DialogContentText>
          {confirmDialog.contractData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover" }}>
              <Typography variant="body2">
                Mijoz: {confirmDialog.contractData.customer?.fullName}
              </Typography>
              <Typography variant="body2">
                Mahsulot: {confirmDialog.contractData.productName}
              </Typography>
            </Box>
          )}
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
            variant="contained">
            Tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
