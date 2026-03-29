import { memo, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";

import {
  Box,
  Tab,
  Tabs,
  Stack,
  Badge,
  Button,
  Dialog,
  Tooltip,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
  TextField,
  Autocomplete,
} from "@mui/material";

import CustomerTable from "./customerTable";
import { columnsPageCustomers, columnsNewPageCustomers } from "./columns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import type { RootState } from "@/store";

import {
  getCustomers,
  getNewCustomers,
  bulkDeleteCustomers,
} from "@/store/actions/customerActions";
import { getManagers } from "@/store/actions/employeeActions";

import authApi from "@/server/auth";
import Loader from "@/components/loader/Loader";

import { DashboardContent } from "@/layouts/dashboard";
import { Iconify } from "@/components/iconify";
import { exportCustomersToCSV } from "@/utils/export-csv";
import { setModal } from "@/store/slices/modalSlice";
import { setCustomerId } from "@/store/slices/customerSlice";

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
      id={`tabpanel-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const CustomerView = () => {
  const dispatch = useAppDispatch();
  const dataEmployee = useSelector((state: RootState) => state.employee);
  const { customers, newCustomers, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );
  const { profile } = useSelector((state: RootState) => state.auth);

  const [manager, setManager] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);

  const isAdmin = profile?.role === "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Manager Filter Logic ---
  const handleCustomerFocus = useCallback(() => {
    dispatch(getManagers());
  }, [dispatch]);

  const managerFullName =
    manager ? `${manager.firstName} ${manager.lastName}` : null;

  const filterListByManager = useCallback(
    (list: any[]) => {
      if (!managerFullName) return list;
      console.log("🔍 Customer Filter Debug:", {
        managerFullName,
        listLength: list.length,
        firstItem: list[0],
        firstItemManager: list[0]?.manager,
      });
      return list.filter((item) => {
        const m = item.manager; // In customers, manager is usually at root
        if (m && typeof m === "object") {
          const name = `${m.firstName || ""} ${m.lastName || ""}`.trim();
          return name === managerFullName;
        }
        return m === managerFullName;
      });
    },
    [managerFullName],
  );

  const filteredCustomers = useMemo(
    () => filterListByManager(customers),
    [customers, filterListByManager],
  );
  const filteredNewCustomers = useMemo(
    () => filterListByManager(newCustomers),
    [newCustomers, filterListByManager],
  );

  const ManagerFilter = (
    <Autocomplete
      onFocus={handleCustomerFocus}
      options={dataEmployee.managers}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
      isOptionEqualToValue={(option, value) =>
        `${option.firstName} ${option.lastName}` ===
        `${value.firstName} ${value.lastName}`
      }
      loading={dataEmployee.isLoading}
      renderInput={(params) => {
        const { InputLabelProps, ...restParams } = params;
        return (
          <TextField
            {...restParams}
            size="small"
            label="Menejer bo'yicha filter"
            InputLabelProps={InputLabelProps as any}
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
        );
      }}
      onChange={(_event, value) => setManager(value)}
      value={manager}
      sx={{ minWidth: 200, maxWidth: 350, width: "100%" }}
    />
  );

  // --- Handlers ---
  const handleBulkDelete = () => {
    dispatch(bulkDeleteCustomers(selectedRows));
    setBulkDeleteDialog(false);
    setSelectedRows([]);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await authApi.post("/excel/import", formData);
      if (response.data.success) {
        enqueueSnackbar("Import muvaffaqiyatli", { variant: "success" });
        dispatch(getCustomers());
        dispatch(getNewCustomers());
      }
    } catch (error: any) {
      enqueueSnackbar("Xatolik yuz berdi", { variant: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getNewCustomers());
  }, [dispatch]);

  if (customers.length === 0 && isLoading) return <Loader />;

  return (
    <DashboardContent>
      <Stack spacing={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          mb={1}>
          <Box sx={{ flexGrow: 1 }}></Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="CSV formatda yuklab olish">
              <Button
                variant="outlined"
                color="success"
                startIcon={<Iconify icon="mingcute:download-2-line" />}
                onClick={() =>
                  exportCustomersToCSV(tab === 0 ? customers : newCustomers)
                }>
                Export CSV
              </Button>
            </Tooltip>

            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  uploading ?
                    <CircularProgress size={20} color="inherit" />
                  : <RiUploadCloud2Fill />
                }
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}>
                {uploading ? "Yuklanmoqda..." : "Import"}
              </Button>
            )}

            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() =>
                dispatch(
                  setModal({
                    modal: "customerModal",
                    data: { type: "add", data: undefined },
                  }),
                )
              }>
              Qo&apos;shish
            </Button>
          </Stack>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
            <Tab
              label={
                <Typography variant="subtitle2" fontWeight={700}>
                  Mijozlar
                </Typography>
              }
            />
            <Tab
              label={
                <Badge color="error" badgeContent={newCustomers.length}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ pr: 1 }}>
                    Yangi mijozlar
                  </Typography>
                </Badge>
              }
            />
          </Tabs>
        </Box>

        {selectedRows.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            px={2}
            py={1}
            sx={{ bgcolor: "error.lighter", borderRadius: 1 }}>
            <Typography
              variant="body2"
              color="error.main"
              fontWeight={700}
              sx={{ flexGrow: 1 }}>
              {selectedRows.length} ta mijoz tanlandi
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
          <CustomerTable
            data={filteredCustomers}
            columns={columnsPageCustomers}
            component={ManagerFilter}
            onRowClick={(row) => dispatch(setCustomerId(row._id))}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={1}>
          <CustomerTable
            data={filteredNewCustomers}
            columns={columnsNewPageCustomers}
            component={ManagerFilter}
            onRowClick={(row) => dispatch(setCustomerId(row._id))}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>
      </Stack>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
      />

      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ color: "error.main" }}>
          Mijozlarni o'chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tanlangan <b>{selectedRows.length}</b> ta mijoz va ularning
            ma'lumotlari bazadan butunlay o'chiriladi.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialog(false)} variant="outlined">
            Bekor qilish
          </Button>
          <Button onClick={handleBulkDelete} variant="contained" color="error">
            O'chirilsin
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
};

export default memo(CustomerView);
