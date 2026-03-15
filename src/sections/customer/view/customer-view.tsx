import { memo, useRef, useState, useEffect } from "react";
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

const CustomerView = () => {
  const dispatch = useAppDispatch();

  const { customers, newCustomers, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  const { profile } = useSelector((state: RootState) => state.auth);
  const isAdmin = profile?.role === "admin";
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const handleBulkDelete = () => {
    dispatch(bulkDeleteCustomers(selectedRows));
    setBulkDeleteDialog(false);
    setSelectedRows([]);
  };

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getNewCustomers());
  }, [dispatch]);

  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      enqueueSnackbar("Faqat Excel fayllar (.xlsx, .xls) qabul qilinadi", {
        variant: "error",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      enqueueSnackbar("Fayl hajmi 10MB dan oshmasligi kerak", {
        variant: "error",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await authApi.post("/excel/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        enqueueSnackbar(response.data.message, {
          variant: "success",
        });

        const { stats } = response.data;
        enqueueSnackbar(
          `Yaratildi: ${stats.contractsCreated} ta shartnoma, ${stats.customersCreated} ta yangi mijoz`,
          {
            variant: "info",
          },
        );

        dispatch(getCustomers());
        dispatch(getNewCustomers());
      } else {
        enqueueSnackbar(response.data.message, {
          variant: "warning",
        });

        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.slice(0, 3).forEach((error: any) => {
            enqueueSnackbar(
              `Qator ${error.row} (${error.customer}): ${error.error}`,
              {
                variant: "error",
              },
            );
          });
        }
      }
    } catch (error: any) {
      console.error("Excel import error:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          "Excel import qilishda xatolik yuz berdi",
        {
          variant: "error",
        },
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (customers.length === 0 && isLoading) {
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
          <Tooltip title="CSV formatda yuklab olish">
            <Button
              variant="outlined"
              color="success"
              startIcon={<Iconify icon="mingcute:download-2-line" />}
              onClick={() => {
                const dataToExport = tab === 0 ? customers : newCustomers;
                exportCustomersToCSV(dataToExport);
                enqueueSnackbar("Mijozlar CSV formatda yuklandi", {
                  variant: "success",
                });
              }}>
              Export CSV
            </Button>
          </Tooltip>

          {isAdmin && (
            <>
              <Tooltip title="Exceldan import qilish">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    uploading ?
                      <CircularProgress size={20} color="inherit" />
                    : <RiUploadCloud2Fill />
                  }
                  onClick={handleImportClick}
                  disabled={uploading}
                  sx={{ ml: 2 }}>
                  {uploading ? "Yuklanmoqda..." : "Import"}
                </Button>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                style={{ display: "none" }}
              />
            </>
          )}

          <Tooltip title="Mijoz qo'shish">
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                dispatch(
                  setModal({
                    modal: "customerModal",
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
            aria-label="basic tabs example">
            <Tab
              label={
                <Typography variant="h6" flexGrow={1}>
                  Mijozlar
                </Typography>
              }
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Badge color="error" badgeContent={newCustomers.length}>
                  <Typography variant="h6" flexGrow={1}>
                    Yangi mijozlar
                  </Typography>
                </Badge>
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
              {selectedRows.length} ta mijoz tanlandi
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
          <CustomerTable
            data={customers}
            columns={columnsPageCustomers}
            onRowClick={(row) => {
              dispatch(setCustomerId(row._id));
            }}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={1}>
          <CustomerTable
            data={newCustomers}
            columns={columnsNewPageCustomers}
            onRowClick={(row) => {
              dispatch(setCustomerId(row._id));
            }}
            selectable={isAdmin}
            setSelectedRows={setSelectedRows}
          />
        </CustomTabPanel>
      </Stack>

      {}
      <Dialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ color: "error.main" }}>
          {selectedRows.length} ta mijozni o'chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tanlangan <b>{selectedRows.length}</b> ta mijoz va ularning barcha
            shartnoma, to'lov ma'lumotlari bazadan <b>butunlay o'chiriladi</b>.
            Bu amalni qaytarib bo'lmaydi!
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
    </DashboardContent>
  );
};

export default memo(CustomerView);
