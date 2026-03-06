import type { Column } from "@/components/table/types";
import {
  Chip,
  Box,
  IconButton,
  Tooltip,
  Stack,
  Typography,
} from "@mui/material";
import {
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdStickyNote2,
  MdTrendingUp,
  MdContentCopy,
} from "react-icons/md";
import { enqueueSnackbar } from "notistack";

export const columnsCash: Column[] = [
  {
    id: "day",
    label: "Kun",
    sortable: true,
    filterable: false,
    minWidth: 50,
    width: 70,
    renderCell: (row) => {
      // ✅ TUZATISH: Birinchi navbatda shartnomadagi "to'lov kuni"ni ko'rsatish
      // Agar bu oylik to'lov bo'lsa
      if (row.paymentType === "monthly") {
        if (row.initialPaymentDueDate) {
          return new Date(row.initialPaymentDueDate)
            .getDate()
            .toString()
            .padStart(2, "0");
        }
        if (row.originalPaymentDay) {
          return row.originalPaymentDay.toString().padStart(2, "0");
        }
      }

      // Agar bu boshlang'ich to'lov bo'lsa yoki shartnoma boshlangan kun kerak bo'lsa
      if (row.paymentType === "initial" && row.contractStartDate) {
        return new Date(row.contractStartDate)
          .getDate()
          .toString()
          .padStart(2, "0");
      }

      // Fallback: row.date dan kunni olish
      if (row.date) {
        const day = new Date(row.date).getDate();

        // ✅ Eslatma uchun icon qo'shish
        if (row.isReminderNotification) {
          const paymentDate = new Date(row.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          paymentDate.setHours(0, 0, 0, 0);
          const isExpired = paymentDate < today;

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MdAccessTime
                size={16}
                color={
                  isExpired ?
                    "var(--palette-error-main)"
                  : "var(--palette-warning-main)"
                }
              />
              <span>{day.toString().padStart(2, "0")}</span>
            </Box>
          );
        }

        return day.toString().padStart(2, "0");
      }
      return "—";
    },
  },
  {
    id: "contractId",
    label: "Shartnoma",
    sortable: true,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (row.contractId) {
          navigator.clipboard.writeText(row.contractId);
          enqueueSnackbar(`${row.contractId} nusxa olindi`, {
            variant: "success",
            autoHideDuration: 2000,
          });
        }
      };

      if (row.contractId) {
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "primary.main",
              }}>
              {row.contractId}
            </Typography>
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
      }
      return (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      );
    },
  },
  {
    id: "customerId",
    label: "Mijoz",
    sortable: true,
    minWidth: 130,
    width: 160,
    renderCell: (row, onCustomerClick) => {
      if (row.customerId) {
        const displayName = row.customerId.fullName || "";

        return (
          <Typography
            onClick={(e) => {
              e.stopPropagation();
              if (onCustomerClick && row.customerId) {
                onCustomerClick(row.customerId);
              }
            }}
            sx={{
              cursor: "pointer",
              color: "primary.main",
              fontWeight: 500,
              fontSize: "0.8rem",
              "&:hover": {
                textDecoration: "underline",
                color: "primary.dark",
              },
            }}>
            {displayName || "Noma'lum"}
          </Typography>
        );
      }
      return "—";
    },
  },
  {
    id: "managerId",
    label: "Menejer",
    sortable: true,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      // ✅ Faqat managerId'dan menejer ma'lumotlarini olish
      if (!row.managerId) return "—";

      const managerName =
        `${row.managerId.firstName || ""} ${row.managerId.lastName || ""}`.trim();

      if (!managerName) return "—";

      return (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "text.primary",
          }}>
          {managerName}
        </Typography>
      );
    },
  },
  {
    id: "postponedDays",
    label: "Muddat", // ✅ O'zgartirildi: "Kechikkan kun" -> "Muddat"
    sortable: true,
    minWidth: 70,
    width: 90,
    renderCell: (row) => {
      if (row.isReminderNotification) {
        // Haqiqiy kechiktirilgan kunlarni hisoblash
        // To'lov sanasi - Bugun = Necha kun
        const paymentDate = new Date(row.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        paymentDate.setHours(0, 0, 0, 0);

        const diffTime = paymentDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // ✅ Muddati o'tgan eslatma - qizil rang
        const isExpired = diffDays < 0;

        return (
          <Chip
            label={
              isExpired ? `${Math.abs(diffDays)} kun o'tdi` : `${diffDays} kun`
            }
            color={isExpired ? "error" : "warning"}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        );
      }
      return (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      );
    },
  },
  {
    id: "amount",
    label: "Summa",
    sortable: true,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      // ✅ YANGI: Agar bu eslatma notification bo'lsa, "-" ko'rsatish
      if (row.isReminderNotification) {
        return (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        );
      }

      const isRemainingPayment = !!row.linkedPaymentId;

      const displayAmount =
        isRemainingPayment ?
          row.actualAmount || 0
        : row.actualAmount || row.amount || 0;

      // ✅ To'lov turi label va rangi
      const paymentTypeConfig: Record<string, { label: string; color: any }> = {
        initial: { label: "Boshlang'ich", color: "info" },
        monthly: { label: "Oylik", color: "default" },
        extra: { label: "Qo'shimcha", color: "secondary" },
      };
      const ptConfig =
        row.paymentType ?
          paymentTypeConfig[row.paymentType] || {
            label: row.paymentType,
            color: "default",
          }
        : null;

      return (
        <Stack direction="column" spacing={0.3}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: isRemainingPayment ? "warning.dark" : "success.dark",
              }}>
              ${displayAmount?.toLocaleString() || 0}
            </Typography>
          </Box>
          {/* ✅ To'lov turi chip — har doim ko'rsatiladi */}
          {ptConfig && (
            <Chip
              label={ptConfig.label}
              size="small"
              color={ptConfig.color}
              variant={row.paymentType === "initial" ? "filled" : "outlined"}
              sx={{
                fontSize: "0.6rem",
                height: "18px",
                fontWeight: 600,
                width: "fit-content",
              }}
            />
          )}
          {isRemainingPayment && (
            <Chip
              label="QARZ"
              size="small"
              color="warning"
              variant="filled"
              sx={{
                fontSize: "0.6rem",
                height: "18px",
                fontWeight: 600,
                width: "fit-content",
              }}
            />
          )}
        </Stack>
      );
    },
  },
  {
    id: "paymentMethod",
    label: "To'lov usuli",
    sortable: true,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      if (row.isReminderNotification) {
        return (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        );
      }

      const methodLabels: Record<string, string> = {
        som_cash: "So'm naqd",
        som_card: "So'm karta",
        dollar_cash: "Dollar naqd",
        dollar_card_visa: "Dollar karta (Visa)",
      };

      const methodColors: Record<
        string,
        | "default"
        | "primary"
        | "success"
        | "warning"
        | "error"
        | "info"
        | "secondary"
      > = {
        som_cash: "success",
        som_card: "primary",
        dollar_cash: "warning",
        dollar_card_visa: "info",
      };

      const method = row.paymentMethod;
      if (!method) {
        return (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        );
      }

      return (
        <Chip
          label={methodLabels[method] || method}
          color={methodColors[method] || "default"}
          size="small"
          sx={{
            fontSize: "0.65rem",
            fontWeight: 500,
          }}
        />
      );
    },
  },
  {
    id: "date",
    label: "Sana",
    filterable: false,
    sortable: true,
    minWidth: 100,
    width: 120,
    renderCell: (row) => {
      if (row.date) {
        const date = new Date(row.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const paymentDate = new Date(date);
        paymentDate.setHours(0, 0, 0, 0);
        const isPast = paymentDate < today;

        return (
          <Stack spacing={0.5}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}>
              <MdAccessTime
                size={16}
                color={
                  isPast ?
                    "var(--palette-error-main)"
                  : "var(--palette-text-secondary)"
                }
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: isPast ? "error.main" : "text.primary",
                }}>
                {date.toLocaleDateString("uz-UZ")}
              </Typography>
            </Box>
            {isPast && (
              <Chip
                label="Kechikkan"
                size="small"
                color="error"
                variant="filled"
                sx={{
                  fontSize: "0.55rem",
                  height: "16px",
                  fontWeight: 600,
                  width: "fit-content",
                }}
              />
            )}
          </Stack>
        );
      }
      return "—";
    },
  },
  {
    id: "status",
    label: "Holat",
    sortable: true,
    filterable: false,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      // ✅ YANGI: Eslatma bo'lsa, maxsus status
      if (row.isReminderNotification) {
        // ✅ Muddati o'tgan eslatmani tekshirish
        const paymentDate = new Date(row.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        paymentDate.setHours(0, 0, 0, 0);
        const isExpired = paymentDate < today;

        return (
          <Tooltip
            title={
              isExpired ?
                "Muddati o'tgan eslatma. Keyingi tungi 00:00 da avtomatik o'chiriladi."
              : "Bu eslatma notification, to'lov emas. Faqat ma'lumot uchun ko'rsatilmoqda."
            }
            arrow>
            <Chip
              icon={<MdAccessTime size={16} />}
              label={isExpired ? "Muddati o'tdi" : "Eslatma"}
              color={isExpired ? "error" : "warning"}
              variant="filled"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.65rem",
              }}
            />
          </Tooltip>
        );
      }

      const statusConfig: Record<
        string,
        { label: string; color: any; icon: any }
      > = {
        PENDING: {
          label: "Kutilmoqda",
          color: "warning",
          icon: <MdAccessTime size={16} />,
        },
        PAID: {
          label: "To'langan",
          color: "success",
          icon: <MdCheckCircle size={16} />,
        },
        REJECTED: {
          label: "Rad etilgan",
          color: "error",
          icon: <MdCancel size={16} />,
        },
        UNDERPAID: {
          label: "Kam to'langan",
          color: "error",
          icon: <MdWarning size={16} />,
        },
        OVERPAID: {
          label: "Ko'p to'langan",
          color: "info",
          icon: <MdTrendingUp size={16} />,
        },
      };

      const config = statusConfig[row.status] || {
        label: row.status || "—",
        color: "default",
        icon: null,
      };

      return (
        <Chip
          icon={config.icon}
          label={config.label}
          color={config.color}
          variant="filled"
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "26px",
            px: 1,
          }}
        />
      );
    },
  },
  {
    id: "notes",
    label: "Izoh",
    filterable: false,
    minWidth: 50,
    width: 60,
    renderCell: (row, _onCustomerClick, onNotesClick) => {
      // ✅ Eslatma uchun ham oddiy ikonka
      if (row.isReminderNotification && row.reminderComment) {
        // ✅ Muddati o'tgan eslatmani tekshirish
        const paymentDate = new Date(row.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        paymentDate.setHours(0, 0, 0, 0);
        const isExpired = paymentDate < today;

        return (
          <Tooltip title={row.reminderComment} arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onNotesClick) {
                  onNotesClick(row);
                }
              }}
              sx={{
                color: isExpired ? "error.main" : "warning.main",
                "&:hover": {
                  bgcolor:
                    isExpired ?
                      "rgba(var(--palette-error-mainChannel) / 0.08)"
                    : "rgba(var(--palette-warning-mainChannel) / 0.08)",
                },
                p: 1,
              }}>
              <MdStickyNote2 size={22} />
            </IconButton>
          </Tooltip>
        );
      }

      if (row.notes && typeof row.notes === "object" && "text" in row.notes) {
        const text = row.notes.text || "—";
        const hasNotes = text && text !== "—";

        return (
          <Tooltip title={hasNotes ? "Izohni ko'rish" : "Izoh yo'q"} arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onNotesClick && hasNotes) {
                  onNotesClick(row);
                }
              }}
              disabled={!hasNotes}
              sx={{
                color: hasNotes ? "primary.main" : "text.disabled",
                "&:hover": {
                  bgcolor:
                    hasNotes ?
                      "rgba(var(--palette-primary-mainChannel) / 0.08)"
                    : "transparent",
                },
                p: 1,
              }}>
              <MdStickyNote2 size={22} />
            </IconButton>
          </Tooltip>
        );
      }
      return (
        <Tooltip title="Izoh yo'q" arrow>
          <span>
            <IconButton size="small" disabled sx={{ p: 1 }}>
              <MdStickyNote2 size={22} />
            </IconButton>
          </span>
        </Tooltip>
      );
    },
  },
  {
    id: "nextPaymentDate",
    label: "Qolgan to'lov",
    sortable: true,
    minWidth: 110,
    width: 130,
    renderCell: (row) => {
      if (row.remainingAmount && row.remainingAmount > 0) {
        const date = new Date(row.createdAt); // <-- use createdAt now
        const formattedDate = date.toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Tashkent",
        });
        const formattedTime = date.toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Tashkent",
        });

        return (
          <Tooltip
            title={`Qolgan $${row.remainingAmount.toFixed(2)} ni to'lash sanasi`}
            arrow>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                whiteSpace: "nowrap",
              }}>
              <Box
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  color: "text.primary",
                }}>
                {formattedDate}
              </Box>
              <Box
                sx={{
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  fontWeight: 500,
                }}>
                {formattedTime}
              </Box>
            </Box>
          </Tooltip>
        );
      }

      return <Box sx={{ color: "text.disabled", fontSize: "0.7rem" }}>—</Box>;
    },
  },
];
