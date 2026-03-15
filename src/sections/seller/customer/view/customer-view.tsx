import type { RootState } from "@/store";
import type { Column } from "@/components/table/types";

import { useSelector } from "react-redux";
import { memo, useState, useEffect } from "react";

import {
  Box,
  Tab,
  Tabs,
  Stack,
  Badge,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import authApi from "@/server/auth";
import { setModal } from "@/store/slices/modalSlice";
import { DashboardContent } from "@/layouts/dashboard";
import {
  setCustomers,
  setNewCustomers,
  setCustomerId,
} from "@/store/slices/customerSlice";

import { enqueueSnackbar } from "notistack";

import { Iconify } from "@/components/iconify";
import Loader from "@/components/loader/Loader";
import { exportCustomersToCSV } from "@/utils/export-csv";

import CustomerTable from "./customerTable";

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

const columns: Column[] = [
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "phoneNumber",
    label: "Telefon raqami",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "address",
    label: "Manzil",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "passportSeries",
    label: "Passport seriya",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "birthDate",
    label: "Tug'ilgan sana",
    sortable: true,
    format: (value: any) =>
      value ? new Date(value).toLocaleDateString() : "—",
  },
  {
    id: "manager",
    label: "Menejer",
    sortable: false,
    renderCell: (row) =>
      row.manager ?
        `${row.manager.firstName} ${row.manager.lastName || "_"}`
      : "—",
  },
];

const CustomerView = () => {
  const dispatch = useAppDispatch();

  const { customers, newCustomers, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const newRes = await authApi.get("/seller/customer/get-new-all");
        dispatch(setNewCustomers(newRes.data));

        const allRes = await authApi.get("/customer/get-all");
        dispatch(setCustomers(allRes.data));
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, [dispatch]);

  const [tab, setTab] = useState(0);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
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

        <CustomTabPanel value={tab} index={0}>
          <CustomerTable
            data={customers}
            columns={columns}
            onRowClick={(row) => {
              dispatch(setCustomerId(row._id));
            }}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tab} index={1}>
          <CustomerTable
            data={newCustomers}
            columns={columns}
            onRowClick={(row) => {
              dispatch(setCustomerId(row._id));
            }}
          />
        </CustomTabPanel>
      </Stack>
    </DashboardContent>
  );
};

export default memo(CustomerView);
