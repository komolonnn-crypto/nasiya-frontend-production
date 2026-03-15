import type { RootState } from "@/store";
import type { Column } from "@/components/table/types";

import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box, Button, Tooltip, Typography, Tab, Tabs } from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { setModal } from "@/store/slices/modalSlice";
import { DashboardContent } from "@/layouts/dashboard";
import { setContractId } from "@/store/slices/contractSlice";
import {
  getSellerActiveContracts,
  getSellerNewContracts,
  getSellerCompletedContracts,
} from "@/store/actions/contractActions";

import { enqueueSnackbar } from "notistack";

import { Iconify } from "@/components/iconify";
import Loader from "@/components/loader/Loader";
import { exportContractsToCSV } from "@/utils/export-csv";

import ContractTable from "./contactTable";

const columns: Column[] = [
  { id: "customerName", label: "Mijoz", sortable: true },
  { id: "productName", label: "Mahsulot Nomi", sortable: true },
  {
    id: "price",
    label: "Narxi",
    renderCell: (row) => {
      return `${row.price.toLocaleString()} $`;
    },
    sortable: true,
  },
  {
    id: "initialPayment",
    label: "Oldindan To'lov",
    renderCell: (row) => {
      return `${row.initialPayment.toLocaleString()} $`;
    },
    sortable: true,
  },
];

const ContractsView = () => {
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState("new");

  const { contracts, newContracts, completedContracts, isLoading } =
    useSelector((state: RootState) => state.contract);

  useEffect(() => {
    dispatch(getSellerNewContracts());
    dispatch(getSellerActiveContracts());
    dispatch(getSellerCompletedContracts());
  }, [dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const getCurrentData = () => {
    switch (currentTab) {
      case "new":
        return newContracts;
      case "active":
        return contracts;
      case "completed":
        return completedContracts;
      default:
        return newContracts;
    }
  };

  if (isLoading && newContracts.length === 0 && contracts.length === 0) {
    return <Loader />;
  }

  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="end"
        gap={3}
        mb={3}>
        <Typography variant="h4" flexGrow={1}>
          Shartnomalar
        </Typography>
        <Tooltip title="CSV formatda yuklab olish">
          <Button
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="mingcute:download-2-line" />}
            onClick={() => {
              exportContractsToCSV(contracts);
              enqueueSnackbar("Shartnomalar CSV formatda yuklandi", {
                variant: "success",
              });
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

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tab
          label={`Yangi shartnomalar (${newContracts.length})`}
          value="new"
        />
        <Tab label={`Faol shartnomalar (${contracts.length})`} value="active" />
        <Tab
          label={`Tugatilgan (${completedContracts.length})`}
          value="completed"
        />
      </Tabs>

      <ContractTable
        data={getCurrentData()}
        columns={columns}
        onRowClick={(row) => {
          dispatch(setContractId(row._id));
        }}
      />
    </DashboardContent>
  );
};

export default memo(ContractsView);
