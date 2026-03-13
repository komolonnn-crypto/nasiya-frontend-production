import type { Column } from "@/components/table/types"
import dayjs from "dayjs";

export const columnsDebtor: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    minWidth: 45,
    width: 70,
    renderCell: (row: any) => {
      if (row.contracts && Array.isArray(row.contracts)) {
        // ✅ TUZATISH: originalPaymentDay ni birinchi o'rinda ishlatish
        const days = row.contracts
          .map((contract: any) => {
            // Birinchi: originalPaymentDay (eng ishonchli)
            if (contract.originalPaymentDay) {
              return contract.originalPaymentDay;
            }
            // Ikkinchi: initialPaymentDueDate
            if (contract.initialPaymentDueDate) {
              return dayjs(contract.initialPaymentDueDate).date();
            }
            // Fallback: startDate
            if (contract.startDate) {
              return dayjs(contract.startDate).date();
            }
            return null;
          })
          .filter((day: number | null) => day !== null);
        
        // Noyob kunlar
        const uniqueDays = Array.from(new Set(days)).sort((a: any, b: any) => a - b);
        
        if (uniqueDays.length > 0) {
          if (uniqueDays.length <= 3) {
            return uniqueDays.map((d: any) => d.toString().padStart(2, "0")).join(", ");
          }
          const shown = uniqueDays.slice(0, 3).map((d: any) => d.toString().padStart(2, "0")).join(", ");
          return `${shown} +${uniqueDays.length - 3}`;
        }
      }
      
      // Fallback - eski usul
      if (row.createdAt) {
        const day = dayjs(row.createdAt).date();
        return day.toString().padStart(2, "0");
      }
      return "—";
    },
  },
  { 
    id: "fullName", 
    label: "Mijoz", 
    sortable: true,
    minWidth: 150,
    width: 180,
  },
  {
    id: "monthlyPayment",
    label: "Oylik to'lov",
    align: "center",
    sortable: true,
    minWidth: 100,
    width: 120,
    renderCell: (row: any) => {
      if (row.contracts && Array.isArray(row.contracts)) {
        const totalMonthly = row.contracts.reduce(
          (sum: number, contract: any) => sum + (contract.monthlyPayment || 0),
          0
        );
        return `${totalMonthly.toLocaleString()} $`;
      }
      return `${(row.monthlyPayment || 0).toLocaleString()} $`;
    },
  },
  {
    id: "activeContractsCount",
    label: "Faol shartnomalar",
    align: "center",
    format: (value: any) => `${value.toLocaleString()}`,
    sortable: true,
    minWidth: 100,
    width: 130,
  },
  {
    id: "paymentProgress",
    label: "To'lovlar",
    align: "center",
    sortable: false,
    minWidth: 80,
    width: 100,
    renderCell: (row: any) => {
      // Mijoz bo'yicha guruhlangan ma'lumotda contracts array bor
      if (row.contracts && Array.isArray(row.contracts)) {
        // Barcha shartnomalardan to'langan oylar va umumiy oylarni yig'amiz
        const totalPaid = row.contracts.reduce((sum: number, contract: any) => 
          sum + (contract.paidMonthsCount || 0), 0
        );
        const totalMonths = row.contracts.reduce((sum: number, contract: any) => 
          sum + (contract.period || 0), 0
        );
        
        if (totalMonths > 0) {
          return `${totalPaid}/${totalMonths}`;
        }
      }
      return "—";
    },
  },
  {
    id: "totalPrice",
    label: "Umumiy narxi",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 100,
    width: 120,
  },
  {
    id: "totalPaid",
    label: "To'langan summa",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 100,
    width: 120,
  },
  {
    id: "remainingDebt",
    label: "Qoldiq summa",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 100,
    width: 120,
  },
  { 
    id: "manager", 
    label: "Manager",
    minWidth: 100,
    width: 130,
  },
];

export const columnsContract: Column[] = [
  {
    id: "contractDay",
    label: "Kun",
    sortable: false,
    filterable: false,
    sticky: "left",
    stickyOffset: 0,
    minWidth: 45, 
    width: 45,
    renderCell: (row: any) => {
      // ✅ TUZATISH: originalPaymentDay ni birinchi o'rinda ishlatish (eng ishonchli)
      if (row.originalPaymentDay) {
        return row.originalPaymentDay.toString();
      }
      // Fallback: initialPaymentDueDate dan kun olish
      if (row.initialPaymentDueDate) {
        const day = dayjs(row.initialPaymentDueDate).date();
        return day.toString();
      }
      // Fallback: startDate
      if (row.startDate) {
        const day = dayjs(row.startDate).date();
        return day.toString();
      }
      return "—";
    },
  },
  {
    id: "fullName",
    label: "Mijoz",
    sortable: true,
    sticky: "left",
    stickyOffset: 45,
    minWidth: 150,
    width: 180, 
  },
  { 
    id: "productName", 
    label: "Mahsulot nomi", 
    sortable: true,
    minWidth: 120,
    width: 150, // ✅ Mahsulot nomlari uchun
  },
  {
    id: "monthlyPayment",
    label: "Oylik to'lov",
    format: (value: any) => `${(value || 0).toLocaleString()} $`,
    sortable: true,
    minWidth: 100,
    width: 110,
  },
  {
    id: "totalPrice",
    label: "Jami",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 80,
    width: 100, 
  },
  {
    id: "initialPayment",
    label: "Oldindan",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 80,
    width: 100, 
  },
  {
    id: "totalPaid",
    label: "To'langan",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 80,
    width: 100, 
  },
  {
    id: "remainingDebt",
    label: "Qoldiq",
    format: (value: any) => `${value.toLocaleString()} $`,
    sortable: true,
    minWidth: 80,
    width: 100, 
  },
  {
    id: "startDate",
    label: "Sana",
    format: (value: any) => (value ? value.toString().split("T")[0] : ""),
    sortable: true,
    filterable: false,
    minWidth: 90,
    width: 110, 
  },
  {
    id: "paymentProgress",
    label: "To'lovlar",
    align: "center",
    sortable: false,
    minWidth: 80,
    width: 100,
    renderCell: (row: any) => {
      const paidMonths = row.paidMonthsCount || 0;
      const totalMonths = row.period || 0;
      
      if (totalMonths > 0) {
        return `${paidMonths}/${totalMonths}`;
      }
      return "—";
    },
  },
  {
    id: "delayDays",
    label: "Kechikish",
    sortable: true,
    filterable: false,
    minWidth: 80,
    width: 90,
    renderCell: (row: any) => {
      const delayDays = row.delayDays || 0;

      if (delayDays <= 0) {
        return "—";
      }

      if (delayDays > 30) {
        return `🔴 ${delayDays}`;
      } else if (delayDays > 7) {
        return `🟡 ${delayDays}`;
      }
      return `🟢 ${delayDays}`;
    },
  },
  { 
    id: "manager", 
    label: "Manager", 
    sortable: true,
    minWidth: 100,
    width: 130, 
  },
];
