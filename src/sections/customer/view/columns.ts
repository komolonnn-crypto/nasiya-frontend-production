import type { Column } from "@/components/table/types";
import dayjs from "dayjs";

export const columnsPageCustomers: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    renderCell: (row) => {
      // 🔍 DEBUG LOG - MIJOZLAR BO'LIMI
      if (
        row.fullName?.includes("P AUS ZAFAR") ||
        row.fullName?.includes("P ISLOM")
      ) {
        console.log("🔍 MIJOZLAR BO'LIMI:", {
          mijoz: row.fullName,
          contracts: row.contracts,
          contractsCount: row.contracts?.length,
          firstContract: row.contracts?.[0],
          originalPaymentDay: row.contracts?.[0]?.originalPaymentDay,
        });
      }

      // ✅ TUZATISH: originalPaymentDay ni birinchi o'rinda ishlatish
      if (
        row.contracts &&
        Array.isArray(row.contracts) &&
        row.contracts.length > 0
      ) {
        const days = row.contracts
          .map((c: any) => {
            // Birinchi: originalPaymentDay (eng ishonchli)
            if (c.originalPaymentDay) {
              return c.originalPaymentDay;
            }
            // Fallback: initialPaymentDueDate dan kun olish
            if (c.initialPaymentDueDate) {
              return dayjs(c.initialPaymentDueDate).date();
            }
            return null;
          })
          .filter((d: any) => d !== null && d !== undefined);

        if (days.length > 0) {
          const uniqueDays = [...new Set<number>(days as number[])].sort(
            (a, b) => a - b,
          );
          if (uniqueDays.length <= 3) {
            return uniqueDays.join(", ");
          }
          return `${uniqueDays.slice(0, 3).join(", ")} +${uniqueDays.length - 3}`;
        }
      }
      return "—";
    },
  },
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
  },
  {
    id: "contractCount",
    label: "Shartnomalar",
    align: "center",
    format: (value: number) => `${value ? value.toLocaleString() : 0}`,
    sortable: true,
    filterable: false,
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
    label: "Password seriya",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "birthDate",
    label: "Tug'ilgan sana",
    sortable: true,
    filterable: false,
    format: (value: any) =>
      value ? new Date(value).toLocaleDateString() : "—",
  },
  {
    id: "manager",
    label: "Menejer",
    sortable: false,
  },
];

export const columnsNewPageCustomers: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    renderCell: (row) => {
      // ✅ TUZATISH: originalPaymentDay ni birinchi o'rinda ishlatish
      if (
        row.contracts &&
        Array.isArray(row.contracts) &&
        row.contracts.length > 0
      ) {
        const days = row.contracts
          .map((c: any) => {
            // Birinchi: originalPaymentDay (eng ishonchli)
            if (c.originalPaymentDay) {
              return c.originalPaymentDay;
            }
            // Fallback: initialPaymentDueDate dan kun olish
            if (c.initialPaymentDueDate) {
              return dayjs(c.initialPaymentDueDate).date();
            }
            return null;
          })
          .filter((d: any) => d !== null && d !== undefined);

        if (days.length > 0) {
          const uniqueDays = [...new Set<number>(days as number[])].sort(
            (a, b) => a - b,
          );
          if (uniqueDays.length <= 3) {
            return uniqueDays.join(", ");
          }
          return `${uniqueDays.slice(0, 3).join(", ")} +${uniqueDays.length - 3}`;
        }
      }
      return "—";
    },
  },
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
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
    label: "Password seriya",
    sortable: true,
    format: (value: any) => (value ? `${value}` : "—"),
  },
  {
    id: "birthDate",
    label: "Tug'ilgan sana",
    sortable: true,
    filterable: false,
    format: (value: any) =>
      value ? new Date(value).toLocaleDateString() : "—",
  },
];
