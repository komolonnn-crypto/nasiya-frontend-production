import type { Column } from "@/components/table/types";
import { Chip, Stack, Tooltip, Box, IconButton } from "@mui/material";
import { MdContentCopy } from "react-icons/md";
import { enqueueSnackbar } from "notistack";
import dayjs from "dayjs";
import { ManagerSelectCellDebtor } from "./ManagerSelectCell";

export const createColumnsPageContract = (
  onManagerChange?: (contractId: string, newManager: string) => void,
): Column[] => [
  {
    id: "day",
    label: "Kun",
    align: "center",
    width: 50,
    sortable: true,
    filterable: false,
    renderCell: (row) => {
      if (
        row.originalPaymentDay !== undefined &&
        row.originalPaymentDay !== null
      ) {
        return String(row.originalPaymentDay).padStart(2, "0");
      }
      if (row.initialPaymentDueDate) {
        const day = dayjs(row.initialPaymentDueDate).date();
        return String(day).padStart(2, "0");
      }
      if (row.startDate) {
        const day = dayjs(row.startDate).date();
        return String(day).padStart(2, "0");
      }
      return "———";
    },
  },
  {
    id: "customId",
    label: "Shartnoma ID",
    align: "center",
    sortable: true,
    filterable: false,
    renderCell: (row) => {
      const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (row.customId) {
          navigator.clipboard.writeText(row.customId);
          enqueueSnackbar(`${row.customId} nusxa olindi`, {
            variant: "success",
            autoHideDuration: 2000,
          });
        }
      };

      if (!row.customId) {
        return "———";
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            {row.customId}
          </span>
          <Tooltip title="Nusxa olish" arrow>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                p: 0.25,
                "&:hover": {
                  bgcolor: "rgba(var(--palette-primary-mainChannel) / 0.08)",
                  color: "primary.main",
                },
              }}>
              <MdContentCopy size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
  {
    id: "customerName",
    label: "Mijoz",
    align: "center",
    sortable: true,
    renderCell: (row) => {
      if (row.customerName && typeof row.customerName === "string") {
        const parts = row.customerName.split(" ");
        if (parts.length > 1 && !isNaN(Number(parts[0]))) {
          return parts.slice(1).join(" ");
        }
        return row.customerName;
      }
      return row.customerName || "———";
    },
  },
  {
    id: "productName",
    label: "Mahsulot Nomi",
    sortable: true,
    align: "center",
  },
  {
    id: "startDate",
    label: "Shartnoma Sanasi",
    align: "center",
    renderCell: (row) => {
      if (row.startDate) {
        return dayjs(row.startDate).format("YYYY-MM-DD");
      }
      return "———";
    },
    sortable: true,
    filterable: false,
  },
  {
    id: "totalPrice",
    label: "Narxi",
    align: "center",
    format: (value: number) => `$${value.toLocaleString()}`,
    sortable: true,
  },
  {
    id: "initialPayment",
    label: "Oldindan To'lov",
    align: "center",
    format: (value: number) => `$${value.toLocaleString()}`,
    sortable: true,
  },
  {
    id: "monthlyPayment",
    label: "Oylik To'lov Miqdori",
    align: "center",
    format: (value: number) => `$${value.toLocaleString()}`,
    sortable: true,
  },
  {
    id: "totalPaid",
    label: "To'langan",
    align: "center",
    format: (value: number) => `$${value?.toLocaleString() || 0}`,
    sortable: true,
  },
  {
    id: "remainingDebt",
    label: "Qolgan qarz",
    align: "center",
    format: (value: number) => `$${value?.toLocaleString() || 0}`,
    sortable: true,
  },
  {
    id: "manager",
    label: "Menejer",
    renderCell: (row) => {
      if (onManagerChange) {
        return (
          <ManagerSelectCellDebtor row={row} onManagerChange={onManagerChange} value=""/>
        );
      }
      if (row.manager) return row.manager;
      return "———";
    },
    sortable: true,
    filterable: true,
    minWidth: 100,
    width: 130,
  },
  {
    id: "info",
    label: "Qo'shimcha",
    align: "center",
    filterable: false,
    renderCell: (row) => {
      const info = row.info || {};
      const items = [
        { key: "box", label: "Karobka", value: info.box },
        { key: "mbox", label: "Muslim karobka", value: info.mbox },
        { key: "receipt", label: "Tilxat", value: info.receipt },
        { key: "iCloud", label: "iCloud", value: info.iCloud },
      ];

      const activeItems = items.filter((item) => item.value);

      if (activeItems.length === 0) {
        return "———";
      }

      return (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          flexWrap="wrap">
          {activeItems.map((item) => (
            <Tooltip key={item.key} title={item.label}>
              <Chip
                label={item.label}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: "11px", height: "18px", borderRadius: "0px" }}
              />
            </Tooltip>
          ))}
        </Stack>
      );
    },
  },
];

export const createColumnsPageNewContract = (
  onManagerChange?: (contractId: string, newManager: string) => void,
): Column[] => [
  {
    id: "productName",
    label: "Mahsulot Nomi",
    sortable: true,
    align: "center",
  },
  { id: "customerName", label: "Mijoz", sortable: true, align: "center" },
  { id: "sellerName", label: "Seller", sortable: true, align: "center" },
  {
    id: "price",
    label: "Narxi",
    align: "center",
    format: (value: number) => `$${value.toLocaleString()}`,
    sortable: true,
  },
  {
    id: "initialPayment",
    label: "Oldindan To'lov",
    align: "center",
    format: (value: number) => `$${value.toLocaleString()}`,
    sortable: true,
  },
  {
    id: "manager",
    label: "Menejer",
    renderCell: (row) => {
      if (onManagerChange) {
        return (
          <ManagerSelectCellDebtor row={row} onManagerChange={onManagerChange} value=""/>
        );
      }
      if (row.manager) return row.manager;
      return "———";
    },
    sortable: true,
    filterable: true,
    minWidth: 100,
    width: 130,
  },
  {
    id: "notes",
    label: "Izoh",
    align: "center",
    filterable: false,
  },
  {
    id: "actions",
    label: "Amallar",
    align: "center",
    filterable: false,
    sortable: false,
  },
];
