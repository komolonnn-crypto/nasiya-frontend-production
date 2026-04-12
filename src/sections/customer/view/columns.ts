import type { Column } from "@/components/table/types";
import dayjs from "dayjs";

import { tableEmptyUz } from "@/utils/table-empty-labels";

/** Bo'sh, noto'g'ri yoki faqat chiziqdan iborat qiymatlarni bir xil ko'rsatish */
function cellText(value: unknown, emptyLabel: string): string {
  if (value == null) return emptyLabel;
  const s = String(value).trim();
  if (!s) return emptyLabel;
  if (/^[\u002D\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]{2,}$/u.test(s)) {
    return emptyLabel;
  }
  return String(value);
}

export const columnsPageCustomers: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    minWidth: 64,
    width: 72,
    renderCell: (row) => {
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

      if (
        row.contracts &&
        Array.isArray(row.contracts) &&
        row.contracts.length > 0
      ) {
        const days = row.contracts
          .map((c: any) => {
            if (c.originalPaymentDay) {
              return c.originalPaymentDay;
            }
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
      return tableEmptyUz.calendarDay;
    },
  },
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
    minWidth: 200,
    width: 220,
  },
  {
    id: "contractCount",
    label: "Shartnomalar",
    align: "center",
    format: (value: number) => `${value ? value.toLocaleString() : 0}`,
    sortable: true,
    filterable: false,
    minWidth: 96,
    width: 108,
  },
  {
    id: "phoneNumber",
    label: "Telefon raqami",
    sortable: true,
    minWidth: 140,
    width: 150,
    format: (value: any) => cellText(value, tableEmptyUz.phone),
  },
  {
    id: "address",
    label: "Manzil",
    sortable: true,
    minWidth: 200,
    width: 240,
    format: (value: any) => cellText(value, tableEmptyUz.address),
  },

  {
    id: "passportSeries",
    label: "Passport seriyasi",
    sortable: true,
    minWidth: 140,
    width: 160,
    format: (value: any) => cellText(value, tableEmptyUz.passportSeries),
  },
  {
    id: "birthDate",
    label: "Tug'ilgan sana",
    sortable: true,
    filterable: false,
    minWidth: 118,
    width: 128,
    format: (value: any) =>
      value ? new Date(value).toLocaleDateString() : tableEmptyUz.birthDate,
  },
  {
    id: "manager",
    label: "Menejer",
    minWidth: 100,
    width: 130,
    sortable: true,
    filterable: true,
  },
];

export const columnsNewPageCustomers: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    minWidth: 64,
    width: 72,
    renderCell: (row) => {
      if (
        row.contracts &&
        Array.isArray(row.contracts) &&
        row.contracts.length > 0
      ) {
        const days = row.contracts
          .map((c: any) => {
            if (c.originalPaymentDay) {
              return c.originalPaymentDay;
            }
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
      return tableEmptyUz.calendarDay;
    },
  },
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
    minWidth: 200,
    width: 220,
  },
  {
    id: "phoneNumber",
    label: "Telefon raqami",
    sortable: true,
    minWidth: 140,
    width: 150,
    format: (value: any) => cellText(value, tableEmptyUz.phone),
  },
  {
    id: "address",
    label: "Manzil",
    sortable: true,
    minWidth: 200,
    width: 240,
    format: (value: any) => cellText(value, tableEmptyUz.address),
  },

  {
    id: "passportSeries",
    label: "Passport seriyasi",
    sortable: true,
    minWidth: 140,
    width: 160,
    format: (value: any) => cellText(value, tableEmptyUz.passportSeries),
  },
  {
    id: "birthDate",
    label: "Tug'ilgan sana",
    sortable: true,
    filterable: false,
    minWidth: 118,
    width: 128,
    format: (value: any) =>
      value ? new Date(value).toLocaleDateString() : tableEmptyUz.birthDate,
  },
];
