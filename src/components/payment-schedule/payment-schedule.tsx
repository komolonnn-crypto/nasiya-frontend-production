import type { FC } from "react";
import React, { useState } from "react";

import {
  Box,
  Menu,
  Paper,
  Table,
  Button,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { format, addMonths } from "date-fns";
import { MdContentCopy } from "react-icons/md";
import { Iconify } from "@/components/iconify";
import { PaymentModal } from "@/components/payment-modal";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { editPaymentAmount } from "@/store/actions/paymentActions";
import { enqueueSnackbar } from "notistack";

interface PaymentScheduleItem {
  month: number;
  date: string;
  amount: number;
  isPaid: boolean;
  isInitial?: boolean;
}

interface PaymentScheduleProps {
  startDate: string;
  monthlyPayment: number;
  period: number;
  initialPayment?: number;
  initialPaymentDueDate?: string;
  contractId?: string;
  remainingDebt?: number;
  totalPaid?: number;
  totalPrice?: number;
  prepaidBalance?: number;
  payments?: Array<{
    _id?: string;
    date: Date;
    amount: number;
    actualAmount?: number;
    isPaid: boolean;
    paymentType?: string;
    status?: string;
    remainingAmount?: number;
    excessAmount?: number;
    expectedAmount?: number;
    confirmedAt?: Date;
    notes?: string | { text?: string };
  }>;
  onPaymentSuccess?: () => void;
  customId?: string | undefined;
}

const PaymentSchedule: FC<PaymentScheduleProps> = ({
  startDate,
  monthlyPayment,
  period,
  initialPayment = 0,
  initialPaymentDueDate,
  contractId,
  remainingDebt = 0,
  totalPaid = 0,
  totalPrice,
  prepaidBalance = 0,
  payments = [],
  onPaymentSuccess,
  customId,
}) => {
  const dispatch = useAppDispatch();

  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    amount: number;
    isPayAll?: boolean;
    paymentId?: string;
  }>({
    open: false,
    amount: 0,
  });

  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    note: string;
    month: string;
  }>({
    open: false,
    note: "",
    month: "",
  });

  // 3-nuqta menu state
  const [actionsMenu, setActionsMenu] = useState<{
    anchorEl: HTMLElement | null;
    paymentId: string;
    currentAmount: number;
    month: string;
  }>({
    anchorEl: null,
    paymentId: "",
    currentAmount: 0,
    month: "",
  });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    paymentId: string;
    currentAmount: number;
    newAmount: string;
    month: string;
  }>({
    open: false,
    paymentId: "",
    currentAmount: 0,
    newAmount: "",
    month: "",
  });

  const handleOpenActionsMenu = (
    e: React.MouseEvent<HTMLElement>,
    paymentId: string,
    currentAmount: number,
    month: string,
  ) => {
    e.stopPropagation();
    setActionsMenu({
      anchorEl: e.currentTarget,
      paymentId,
      currentAmount,
      month,
    });
  };

  const handleCloseActionsMenu = () => {
    setActionsMenu({
      anchorEl: null,
      paymentId: "",
      currentAmount: 0,
      month: "",
    });
  };

  const handleOpenEditDialog = () => {
    setEditDialog({
      open: true,
      paymentId: actionsMenu.paymentId,
      currentAmount: actionsMenu.currentAmount,
      newAmount: String(actionsMenu.currentAmount),
      month: actionsMenu.month,
    });
    handleCloseActionsMenu();
  };

  const handleSaveEdit = () => {
    const newAmt = parseFloat(editDialog.newAmount);
    if (isNaN(newAmt) || newAmt < 0) return;
    dispatch(
      editPaymentAmount(editDialog.paymentId, newAmt, () => {
        setEditDialog({
          open: false,
          paymentId: "",
          currentAmount: 0,
          newAmount: "",
          month: "",
        });
        if (onPaymentSuccess) onPaymentSuccess();
      }),
    );
  };

  const handleCopyCustomIdToClipboard = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (customId) {
      navigator.clipboard.writeText(customId);
      enqueueSnackbar(`${customId} nusxa olindi`, {
        variant: "success",
        autoHideDuration: 2000,
      });
    }
  };

  const generateSchedule = (): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = [];
    const start = new Date(startDate);

    // ✅ TUZATILDI: period nol yoki undefined bo'lsa, xato
    if (!period || period <= 0) {
      return schedule;
    }

    const initialPaymentRecord = payments.find(
      (p) => p.paymentType === "initial" && p.isPaid,
    );
    const isInitialPaid = !!initialPaymentRecord;

    if (initialPayment > 0) {
      // ✅ TUZATILDI: Boshlang'ich to'lov sanasi = startDate (shartnoma boshlanish sanasi)
      // initialPaymentDueDate emas - bu har oy to'lanadigan kun
      const initialDate = start; // startDate ishlatish

      schedule.push({
        month: 0,
        date: format(initialDate, "yyyy-MM-dd"),
        amount: initialPayment,
        isPaid: isInitialPaid,
        isInitial: true,
      });
    }
    const monthlyPayments = payments
      .filter((p) => p.paymentType !== "initial" && p.isPaid)
      .sort((a, b) => {
        const dateA = a.confirmedAt
          ? new Date(a.confirmedAt)
          : new Date(a.date);
        const dateB = b.confirmedAt
          ? new Date(b.confirmedAt)
          : new Date(b.date);

        if (dateA.getTime() === dateB.getTime()) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }

        return dateA.getTime() - dateB.getTime();
      });

    // ✅ TUZATILDI: Oylik to'lovlar uchun initialPaymentDueDate ishlatish
    // Bu har oy to'lanadigan kun (masalan: 10)
    const monthlyPaymentStartDate = initialPaymentDueDate
      ? new Date(initialPaymentDueDate)
      : addMonths(start, 1); // Fallback: startDate + 1 oy

    for (let i = 1; i <= period; i++) {
      // i=1 uchun monthlyPaymentStartDate, i=2 uchun +1 oy, va hokazo
      const paymentDate = addMonths(monthlyPaymentStartDate, i - 1);

      const isPaid = i <= monthlyPayments.length;

      schedule.push({
        month: i,
        date: format(paymentDate, "yyyy-MM-dd"),
        amount: monthlyPayment,
        isPaid,
      });
    }

    return schedule;
  };

  const schedule = generateSchedule();
  const today = new Date();

  const handlePayment = (amount: number, paymentId?: string) => {
    if (paymentId) {
      setPaymentModal({ open: true, amount, paymentId });
    } else {
      setPaymentModal({ open: true, amount });
    }
  };

  const handlePayAll = () => {
    setPaymentModal({ open: true, amount: remainingDebt, isPayAll: true });
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({
      open: false,
      amount: 0,
    });
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{ p: { xs: 1, sm: 1.5 }, border: 1, borderColor: "divider", borderRadius: "18px" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
          flexWrap="wrap"
          gap={1}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                To'lov jadvali
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {period || 0} oylik •{" "}
                {schedule?.filter((s) => s.isPaid).length || 0}/
                {schedule?.length || 0} to'langan
              </Typography>
            </Box>

            {customId && (
              <Box ml={2}>
                <Typography variant="subtitle2" fontWeight="600">
                  Shartnoma ID
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  onClick={handleCopyCustomIdToClipboard}
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {customId}
                  </Typography>

                  <Tooltip title="Nusxa olish" arrow>
                    <IconButton
                      size="small"
                      onClick={handleCopyCustomIdToClipboard}
                      sx={{
                        p: 0.25,
                        "&:hover": {
                          bgcolor: "rgba(var(--palette-primary-mainChannel) / 0.08)",
                          color: "primary.main",
                        },
                      }}
                    >
                      <MdContentCopy size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Box>

          {remainingDebt > 0 && contractId && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handlePayAll}
              sx={{ borderRadius: "12px" }}
            >
              Barchasini to'lash ({remainingDebt.toLocaleString()} $)
            </Button>
          )}
        </Box>

        <TableContainer sx={{ maxHeight: "60vh", overflowX: "auto" ,borderRadius: "12px"}}>
          <Table
            size="small"
            stickyHeader
            sx={{ minWidth: "100%", width: "100%" }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Belgilangan sana
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  To'langan sana
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Summa
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  To&apos;langan
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75, md: 1 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Holat
                </TableCell>
                {contractId && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      bgcolor: "background.neutral",
                      py: 0.25,
                      px: { xs: 0.5, sm: 0.75, md: 1 },
                      fontSize: { xs: "0.688rem", sm: "0.75rem" },
                      borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Amal
                  </TableCell>
                )}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "background.neutral",
                    py: 0.25,
                    px: { xs: 0.5, sm: 0.75 },
                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                    borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Izoh
                </TableCell>
                {contractId && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      bgcolor: "background.neutral",
                      py: 0.25,
                      px: { xs: 0.5, sm: 0.75 },
                      fontSize: { xs: "0.688rem", sm: "0.75rem" },
                      borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const sortedPayments = [...payments].sort((a, b) => {
                  const dateA = a.confirmedAt
                    ? new Date(a.confirmedAt)
                    : new Date(a.date);
                  const dateB = b.confirmedAt
                    ? new Date(b.confirmedAt)
                    : new Date(b.date);

                  if (dateA.getTime() === dateB.getTime()) {
                    return (
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                  }

                  return dateA.getTime() - dateB.getTime();
                });

                const paidMonthlyPayments = sortedPayments.filter(
                  (p) => p.paymentType !== "initial" && p.isPaid,
                );

                let previousExcess = 0;

                return schedule.map((item, _index) => {
                  const isPast = new Date(item.date) < today;

                  let actualPayment;

                  if (item.isInitial) {
                    actualPayment = payments.find(
                      (p) => p.paymentType === "initial" && p.isPaid,
                    );
                  } else {
                    actualPayment = paidMonthlyPayments[item.month - 1];
                  }

                  // Ortiqcha va kam to'langan summalarni tekshirish

                  let remainingAmountToShow = 0;
                  let hasShortage = false;

                  if (actualPayment && item.isPaid) {
                    // PRIORITY 1: remainingAmount (backend'dan to'g'ridan-to'g'ri)
                    if (
                      actualPayment.remainingAmount != null &&
                      actualPayment.remainingAmount > 0.01
                    ) {
                      remainingAmountToShow = actualPayment.remainingAmount;
                      hasShortage = true;
                    }
                    // PRIORITY 2: actualAmount mavjud va expectedAmount'dan kam
                    else if (
                      actualPayment.actualAmount != null &&
                      actualPayment.actualAmount !== undefined
                    ) {
                      const expected =
                        actualPayment.expectedAmount ||
                        actualPayment.amount ||
                        item.amount;
                      const actual = actualPayment.actualAmount;
                      const diff = expected - actual;

                      if (diff > 0.01) {
                        remainingAmountToShow = diff;
                        hasShortage = true;
                      }
                    }
                    // PRIORITY 3: Status UNDERPAID
                    else if (actualPayment.status === "UNDERPAID") {
                      const expected =
                        actualPayment.expectedAmount ||
                        actualPayment.amount ||
                        item.amount;
                      const actual = actualPayment.amount;
                      const diff = expected - actual;

                      if (diff > 0.01) {
                        remainingAmountToShow = diff;
                        hasShortage = true;
                      }
                    } else if (
                      actualPayment.actualAmount === undefined ||
                      actualPayment.actualAmount === null
                    ) {
                      const expected = item.amount; // Oylik to'lov
                      const actual = actualPayment.amount; // Haqiqatda to'langan (eski to'lovlarda)
                      const diff = expected - actual;

                      if (diff > 0.01) {
                        remainingAmountToShow = diff;
                        hasShortage = true;
                      }
                    }
                  }

                  let actualPaidAmount = 0;
                  if (item.isPaid && actualPayment) {
                    actualPaidAmount =
                      actualPayment.actualAmount || actualPayment.amount || 0;
                  }

                  // const expectedAmount =
                  //   actualPayment?.expectedAmount || item.amount;

                  // ✅ TUZATILDI: Kechikish kunlarini to'g'ri hisoblash
                  let delayDays = 0;
                  const scheduledDate = new Date(item.date);
                  const todayNormalized = new Date();
                  todayNormalized.setHours(0, 0, 0, 0); // Faqat sana, vaqtsiz

                  if (actualPayment && item.isPaid) {
                    // To'lov qilingan: to'lov sanasi bilan scheduled sana o'rtasidagi farq
                    const paidDate = new Date(actualPayment.date);
                    paidDate.setHours(0, 0, 0, 0);
                    delayDays = Math.floor(
                      (paidDate.getTime() - scheduledDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                  } else if (!item.isPaid && scheduledDate < todayNormalized) {
                    // To'lov qilinmagan va muddat o'tgan: bugun bilan scheduled sana o'rtasidagi farq
                    delayDays = Math.floor(
                      (todayNormalized.getTime() - scheduledDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                  }

                  // KASKAD LOGIKA - Serverdan kelgan ma'lumotlarni ishlatish
                  const fromPreviousMonth = previousExcess; // Oldingi oydan kelgan
                  const monthlyPaymentAmount = item.amount; // Oylik to'lov

                  // Agar actualPayment mavjud bo'lsa, serverdan kelgan expectedAmount ni ishlatamiz
                  const needToPay = actualPayment?.expectedAmount
                    ? actualPayment.expectedAmount
                    : Math.max(0, monthlyPaymentAmount - fromPreviousMonth); // To'lash kerak

                  const actuallyPaid = actualPaidAmount;

                  let toNextMonth = 0;
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  let shortage = 0;

                  if (item.isPaid && actualPayment) {
                    if (
                      actualPayment.remainingAmount &&
                      actualPayment.remainingAmount > 0.01
                    ) {
                      shortage = actualPayment.remainingAmount;
                    } else {
                      // Agar server ma'lumoti bo'lmasa, o'zimiz hisoblash
                      const diff = actuallyPaid - needToPay;
                      if (diff > 0.01) {
                        toNextMonth = diff;
                      } else if (diff < -0.01) {
                        shortage = Math.abs(diff);
                      }
                    }
                  }

                  // Keyingi oy uchun previousExcess ni yangilash
                  if (item.isPaid) {
                    previousExcess = toNextMonth;
                  } else {
                    previousExcess = 0; // Agar to'lanmagan bo'lsa, kaskad to'xtaydi
                  }

                  return (
                    <React.Fragment key={`payment-${item.month}`}>
                      <TableRow
                        sx={{
                          bgcolor: item.isPaid
                            ? "rgba(var(--palette-success-mainChannel) / 0.1)"
                            : isPast && !item.isPaid
                              ? "rgba(var(--palette-error-mainChannel) / 0.1)"
                              : "inherit",
                          borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          "&:hover": {
                            bgcolor: item.isPaid
                              ? "rgba(var(--palette-success-mainChannel) / 0.18)"
                              : isPast && !item.isPaid
                                ? "rgba(var(--palette-error-mainChannel) / 0.18)"
                                : "background.neutral",
                          },
                          "&:last-child": {
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          },
                        }}
                      >
                        {/* # */}
                        <TableCell
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {isPast && !item.isPaid && (
                              <Iconify
                                icon="mdi:alert-circle"
                                width={16}
                                sx={{ color: "error.main" }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              fontSize={{ xs: "0.688rem", sm: "0.75rem" }}
                              color={
                                isPast && !item.isPaid
                                  ? "error.main"
                                  : "inherit"
                              }
                            >
                              {item.isInitial
                                ? "Boshlang'ich"
                                : `${item.month}-oy`}
                              {isPast && !item.isPaid && " (Kechikkan)"}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Belgilangan sana */}
                        <TableCell
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.688rem", sm: "0.75rem" }}
                          >
                            {format(new Date(item.date), "dd.MM.yyyy")}
                          </Typography>
                        </TableCell>

                        {/* To'langan sana */}
                        <TableCell
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          {item.isPaid ? (
                            <Typography
                              variant="body2"
                              fontSize="0.75rem"
                              color={
                                delayDays > 0 ? "error.main" : "success.main"
                              }
                            >
                              {item.isInitial
                                ? format(new Date(item.date), "dd.MM.yyyy")
                                : actualPayment && actualPayment.confirmedAt
                                  ? format(
                                      new Date(actualPayment.confirmedAt),
                                      "dd.MM.yyyy",
                                    )
                                  : actualPayment
                                    ? format(
                                        new Date(actualPayment.date),
                                        "dd.MM.yyyy",
                                      )
                                    : format(new Date(item.date), "dd.MM.yyyy")}
                              {!item.isInitial &&
                                delayDays > 0 &&
                                ` (+${delayDays})`}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Summa - Oylik to'lov (har doim bir xil) */}
                        <TableCell
                          align="right"
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            fontSize={{ xs: "0.688rem", sm: "0.75rem" }}
                          >
                            {item.amount.toLocaleString()} $
                          </Typography>
                        </TableCell>

                        {/* To'langan */}
                        <TableCell
                          align="right"
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          {item.isPaid ? (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="flex-end"
                              gap={0.3}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                color="success.main"
                                fontSize="0.813rem"
                              >
                                {actualPaidAmount.toLocaleString()} $
                              </Typography>
                              {hasShortage && remainingAmountToShow > 0.01 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "error.main",
                                    fontWeight: 600,
                                    fontSize: "0.688rem",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  ({remainingAmountToShow.toLocaleString()} $
                                  kam)
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Holat */}
                        <TableCell
                          align="center"
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75, md: 1 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.688rem", sm: "0.75rem" },
                              fontWeight: 600,
                              color: item.isPaid
                                ? "success.main"
                                : isPast
                                  ? "error.main"
                                  : "text.secondary",
                            }}
                          >
                            {item.isPaid
                              ? "Paid"
                              : isPast
                                ? "Kechikkan"
                                : "Kutilmoqda"}
                          </Typography>
                        </TableCell>

                        {/* Amal */}
                        {contractId && (
                          <TableCell
                            align="center"
                            sx={{
                              py: 0.25,
                              px: { xs: 0.5, sm: 0.75, md: 1 },
                              borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                            }}
                          >
                            {!item.isPaid ? (
                              <Typography
                                variant="body2"
                                onClick={() => handlePayment(item.amount)}
                                sx={{
                                  fontSize: { xs: "0.688rem", sm: "0.75rem" },
                                  fontWeight: 600,
                                  color: isPast ? "error.main" : "primary.main",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.5,
                                  "&:hover": {
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                <Iconify icon="mdi:cash" width={16} />
                                To'lash
                              </Typography>
                            ) : hasShortage && remainingAmountToShow > 0.01 ? (
                              <Box>
                                <Typography
                                  variant="body2"
                                  onClick={() => {
                                    if (!actualPayment?._id) {
                                      alert(
                                        "Xatolik: To'lov ID topilmadi. Sahifani yangilang va qayta urinib ko'ring.",
                                      );
                                      return;
                                    }

                                    handlePayment(
                                      remainingAmountToShow,
                                      actualPayment._id,
                                    );
                                  }}
                                  sx={{
                                    fontSize: { xs: "0.688rem", sm: "0.75rem" },
                                    fontWeight: 600,
                                    color: "error.main",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.5,
                                    animation: "pulse 2s infinite",
                                    "@keyframes pulse": {
                                      "0%, 100%": { opacity: 1 },
                                      "50%": { opacity: 0.7 },
                                    },
                                    "&:hover": {
                                      opacity: 0.8,
                                    },
                                  }}
                                >
                                  <Iconify icon="mdi:alert-circle" width={16} />
                                  Qarz ({remainingAmountToShow.toLocaleString()}{" "}
                                  $)
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.688rem", sm: "0.75rem" },
                                  fontWeight: 600,
                                  color: "success.main",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Iconify icon="mdi:check-circle" width={16} />
                                To'langan
                              </Typography>
                            )}
                          </TableCell>
                        )}

                        {/* ✅ YANGI: Izoh icon */}
                        <TableCell
                          align="center"
                          sx={{
                            py: 0.25,
                            px: { xs: 0.5, sm: 0.75 },
                            borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                          }}
                        >
                          {(() => {
                            const noteText = actualPayment?.notes
                              ? typeof actualPayment.notes === "string"
                                ? actualPayment.notes
                                : actualPayment.notes?.text || ""
                              : "";
                            return noteText ? (
                              <Tooltip title="Izohni ko'rish">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => {
                                    setNoteDialog({
                                      open: true,
                                      note: noteText,
                                      month: item.isInitial
                                        ? "Boshlang'ich to'lov"
                                        : `${item.month}-oy`,
                                    });
                                  }}
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                  }}
                                >
                                  <Iconify
                                    icon="solar:chat-round-line-bold"
                                    width={20}
                                  />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{
                                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                                }}
                              >
                                -
                              </Typography>
                            );
                          })()}
                        </TableCell>

                        {/* Amallar - 3 nuqta menu (Izohdan keyin) */}
                        {contractId && (
                          <TableCell
                            align="center"
                            sx={{
                              py: 0.25,
                              px: { xs: 0.5, sm: 0.75 },
                              borderBottom: "1px solid rgba(var(--palette-grey-500Channel) / 0.2)",
                            }}
                          >
                            {item.isPaid && actualPayment?._id ? (
                              <Tooltip title="Amallar">
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleOpenActionsMenu(
                                      e,
                                      actualPayment._id!,
                                      actualPayment.actualAmount ??
                                        actualPayment.amount,
                                      item.isInitial
                                        ? "Boshlang'ich to'lov"
                                        : `${item.month}-oy`,
                                    )
                                  }
                                  sx={{
                                    p: 0.5,
                                    color: "text.primary",
                                    "&:hover": { bgcolor: "background.neutral" },
                                  }}
                                >
                                  <Iconify
                                    icon="eva:more-vertical-fill"
                                    width={22}
                                  />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{
                                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                                }}
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    </React.Fragment>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Xulosa - Ixcham */}
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: "background.neutral",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Umumiy
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {/* ✅ FIXED: totalPrice backend'dan kelsa uni ishlatamiz, aks holda hisoblash. NaN oldini olish uchun 0 bilan almashtiramiz */}
                {(
                  totalPrice ||
                  (monthlyPayment || 0) * (period || 0) + (initialPayment || 0)
                ).toLocaleString()}{" "}
                $
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                To'langan
              </Typography>
              <Typography variant="body2" fontWeight="600" color="success.main">
                {(totalPaid || 0).toLocaleString()} $
              </Typography>
            </Box>
            {remainingDebt > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Qolgan
                </Typography>
                <Typography variant="body2" fontWeight="600" color="error.main">
                  {(remainingDebt || 0).toLocaleString()} $
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* To'lov modal */}
      {contractId && (
        <PaymentModal
          open={paymentModal.open}
          amount={paymentModal.amount}
          contractId={contractId}
          {...(paymentModal.isPayAll !== undefined && {
            isPayAll: paymentModal.isPayAll,
          })}
          {...(paymentModal.paymentId && { paymentId: paymentModal.paymentId })}
          onClose={() =>
            setPaymentModal({
              open: false,
              amount: 0,
            })
          }
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* 3-nuqta actions menu */}
      <Menu
        anchorEl={actionsMenu.anchorEl}
        open={Boolean(actionsMenu.anchorEl)}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" width={18} />
          </ListItemIcon>
          <ListItemText>Summani tahrirlash</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit amount dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() =>
          setEditDialog({
            open: false,
            paymentId: "",
            currentAmount: 0,
            newAmount: "",
            month: "",
          })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          To'lov summasini tahrirlash — {editDialog.month}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={1}
              display="block"
            >
              Joriy summa: <b>{editDialog.currentAmount.toLocaleString()} $</b>
            </Typography>
            <TextField
              label="Yangi summa ($)"
              type="number"
              fullWidth
              value={editDialog.newAmount}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  newAmount: e.target.value,
                }))
              }
              inputProps={{ min: 0, step: "0.01" }}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setEditDialog({
                open: false,
                paymentId: "",
                currentAmount: 0,
                newAmount: "",
                month: "",
              })
            }
            variant="outlined"
            color="inherit"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={
              editDialog.newAmount === "" ||
              isNaN(parseFloat(editDialog.newAmount)) ||
              parseFloat(editDialog.newAmount) < 0
            }
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ YANGI: Izoh dialog */}
      <Dialog
        open={noteDialog.open}
        onClose={() => setNoteDialog({ open: false, note: "", month: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="solar:chat-round-line-bold" width={24} />
            <Typography variant="h6">
              To'lov izohi - {noteDialog.month}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.neutral",
              borderRadius: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="body2">{noteDialog.note}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNoteDialog({ open: false, note: "", month: "" })}
            color="primary"
          >
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentSchedule;
