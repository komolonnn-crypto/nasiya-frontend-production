import type { RootState } from "@/store";

import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { alpha, useTheme } from "@mui/material/styles";

import {
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";

import {
  MdPerson,
  MdPayment,
  MdAccessTime,
  MdStickyNote2,
  MdCalendarToday,
  MdCheckCircle,
  MdHourglassTop,
  MdAttachMoney,
  MdCreditCard,
} from "react-icons/md";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import authApi from "@/server/auth";
import { closeModal } from "@/store/slices/modalSlice";

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const paymentTypeConfig: Record<string, { label: string; color: "info" | "primary" | "secondary" }> = {
  initial: { label: "Boshlang'ich to'lov", color: "info" },
  monthly: { label: "Oylik to'lov",        color: "primary" },
  extra:   { label: "Qo'shimcha to'lov",   color: "secondary" },
};

const paymentMethodLabel: Record<string, string> = {
  som_cash:        "So'm — naqd",
  som_card:        "So'm — karta",
  dollar_cash:     "Dollar — naqd",
  dollar_card_visa: "Dollar — Visa karta",
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    variant="caption"
    color="text.disabled"
    fontWeight={700}
    sx={{ textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1 }}
  >
    {children}
  </Typography>
);

const DetailRow = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5} py={0.9}>
    <Box sx={{ color: "text.disabled", display: "flex", flexShrink: 0 }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color={valueColor || "text.primary"} textAlign="right">
      {value ?? "—"}
    </Typography>
  </Stack>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const ModalCashInfo = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { cashInfoModal } = useSelector((state: RootState) => state.modal);

  const [contract, setContract] = useState<any>(null);
  const [contractLoading, setContractLoading] = useState(false);

  const payment = cashInfoModal?.data as any;
  const contractId = payment?.contractId;

  const handleClose = useCallback(() => {
    dispatch(closeModal("cashInfoModal"));
    setContract(null);
  }, [dispatch]);

  useEffect(() => {
    setContract(null);
    if (!contractId) return;
    const fetchContract = async () => {
      try {
        setContractLoading(true);
        const res = await authApi.get(`/contract/get-contract-by-id/${contractId}`);
        setContract(res.data);
      } catch {
        //
      } finally {
        setContractLoading(false);
      }
    };
    fetchContract();
  }, [contractId, cashInfoModal]);

  if (!payment) return null;

  // ─── DERIVED VALUES ──────────────────────────────────────────────────────

  const customerName =
    payment?.customerId?.fullName ||
    `${payment?.customerId?.firstName || ""} ${payment?.customerId?.lastName || ""}`.trim() ||
    "Noma'lum mijoz";

  const managerName = payment?.managerId
    ? `${payment.managerId.firstName || ""} ${payment.managerId.lastName || ""}`.trim()
    : "—";

  const notesText =
    typeof payment?.notes === "object" ? payment?.notes?.text : payment?.notes;

  const showNotes = notesText && notesText !== "To'lov amalga oshirildi";

  const ptConfig = payment?.paymentType ? paymentTypeConfig[payment.paymentType] : null;
  const methodLabel = payment?.paymentMethod ? paymentMethodLabel[payment.paymentMethod] : null;

  const amount = payment.actualAmount || payment.amount || 0;

  const isPending = payment?.status === "PENDING";
  const isPaid    = payment?.status === "PAID";

  const submittedAt = payment?.createdAt
    ? new Date(payment.createdAt).toLocaleString("uz-UZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
        timeZone: "Asia/Tashkent",
      })
    : null;

  // ─── THEME-AWARE COLORS ──────────────────────────────────────────────────

  const statusPalette = isPaid
    ? theme.palette.success
    : isPending
    ? theme.palette.warning
    : theme.palette.primary;

  const headerBg = alpha(statusPalette.main, theme.palette.mode === "dark" ? 0.12 : 0.07);
  const amountBg = alpha(statusPalette.main, theme.palette.mode === "dark" ? 0.18 : 0.1);
  const statusLabel = isPaid ? "To'landi" : isPending ? "Kutilmoqda" : "Noma'lum";

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={!!cashInfoModal?.type}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      onClose={handleClose}
      PaperProps={{
        sx: {
          maxHeight: { xs: "100dvh", sm: "88vh" },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      {/* ═══ HEADER ════════════════════════════════════════════════════════ */}
      <DialogTitle
        sx={{
          p: 0,
          background: headerBg,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={2.5} py={2}>
          {/* Left: icon + title */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: statusPalette.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              {isPaid
                ? <MdCheckCircle size={20} />
                : isPending
                ? <MdHourglassTop size={20} />
                : <MdPayment size={20} />}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                To'lov tafsilotlari
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isPending
                  ? "Kassa tasdiqlashini kutmoqda"
                  : isPaid
                  ? "To'lov muvaffaqiyatli tasdiqlandi"
                  : "To'lov ma'lumotlari"}
              </Typography>
            </Box>
          </Stack>

          {/* Right: status chip */}
          <Chip
            label={statusLabel}
            size="small"
            icon={isPaid ? <MdCheckCircle size={13} /> : isPending ? <MdHourglassTop size={13} /> : undefined}
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor: alpha(statusPalette.main, 0.15),
              color: isPaid ? "success.dark" : isPending ? "warning.dark" : "text.primary",
              border: `1px solid ${alpha(statusPalette.main, 0.35)}`,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>

        {/* ═══ CUSTOMER + AMOUNT HERO ════════════════════════════════════ */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Customer */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: ptConfig ? `${ptConfig.color}.main` : "primary.main",
                fontSize: "1.2rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {customerName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                {customerName}
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                {ptConfig && (
                  <Chip
                    label={ptConfig.label}
                    color={ptConfig.color}
                    size="small"
                    sx={{ fontSize: "0.67rem", fontWeight: 600, height: 20 }}
                  />
                )}
                {payment.targetMonth != null &&
                  payment.paymentType !== "initial" &&
                  payment.targetMonth > 0 && (
                    <Chip
                      label={`${payment.targetMonth}-oy`}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: "0.67rem", height: 20 }}
                    />
                  )}
              </Stack>
            </Box>
          </Stack>

          {/* Amount */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: amountBg,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(statusPalette.main, 0.25),
              textAlign: { xs: "left", sm: "right" },
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1} mb={0.3}>
              Yuborilgan summa
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              color={isPaid ? "success.main" : isPending ? "warning.dark" : "primary.main"}
              lineHeight={1.1}
            >
              ${amount.toLocaleString()}
            </Typography>
          </Box>
        </Stack>

        {/* ═══ TO'LOV MA'LUMOTLARI ════════════════════════════════════════ */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <SectionLabel>To'lov ma'lumotlari</SectionLabel>

          {payment.expectedAmount && payment.expectedAmount !== payment.actualAmount && (
            <>
              <DetailRow
                icon={<MdAttachMoney size={16} />}
                label="Kutilgan summa"
                value={`$${payment.expectedAmount.toLocaleString()}`}
              />
              <Divider />
            </>
          )}

          {payment.remainingAmount != null && payment.remainingAmount > 0.01 && (
            <>
              <DetailRow
                icon={<MdAttachMoney size={16} />}
                label="Qolgan qarz"
                value={`$${payment.remainingAmount.toLocaleString()}`}
                valueColor="error.main"
              />
              <Divider />
            </>
          )}

          {payment.targetMonth != null && (
            <>
              <DetailRow
                icon={<MdCalendarToday size={15} />}
                label="To'lov oyi"
                value={
                  payment.paymentType === "initial" || payment.targetMonth === 0
                    ? "Boshlang'ich"
                    : `${payment.targetMonth}-oy`
                }
              />
              <Divider />
            </>
          )}

          {methodLabel && (
            <DetailRow
              icon={<MdCreditCard size={16} />}
              label="To'lov usuli"
              value={methodLabel}
            />
          )}
        </Box>

        {/* ═══ YUBORUVCHI ════════════════════════════════════════════════ */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <SectionLabel>Yuboruvchi</SectionLabel>

          <Stack direction="row" alignItems="center" spacing={1.5} py={0.5}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {managerName !== "—" ? managerName.charAt(0).toUpperCase() : "?"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Menejer
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {managerName}
              </Typography>
            </Box>
            {submittedAt && (
              <Stack alignItems="flex-end" spacing={0.2}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MdAccessTime size={13} color={theme.palette.text.disabled} />
                  <Typography variant="caption" color="text.disabled">
                    Yuborilgan vaqt
                  </Typography>
                </Stack>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {submittedAt}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* ═══ IZOH ══════════════════════════════════════════════════════ */}
        {showNotes && (
          <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <SectionLabel>Izoh</SectionLabel>
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.1 : 0.06),
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: alpha(theme.palette.info.main, 0.2),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <MdStickyNote2
                  size={16}
                  color={theme.palette.info.main}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {notesText}
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}

        {/* ═══ SHARTNOMA MA'LUMOTLARI ════════════════════════════════════ */}
        {contractId && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} mb={1.5}>
              <MdCalendarToday size={13} color={theme.palette.text.disabled} />
              <SectionLabel>Shartnoma ma'lumotlari</SectionLabel>
            </Stack>

            {contractLoading ? (
              <Stack alignItems="center" py={3}>
                <CircularProgress size={28} />
                <Typography variant="caption" color="text.secondary" mt={1}>
                  Yuklanmoqda...
                </Typography>
              </Stack>
            ) : contract ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Muddat",
                    value: `${contract.period || "—"} oy`,
                    color: undefined,
                  },
                  {
                    label: "Oylik to'lov",
                    value: `$${(contract.monthlyPayment || 0).toLocaleString()}`,
                    color: "primary.main" as const,
                  },
                  {
                    label: "Umumiy summa",
                    value: `$${(contract.totalPrice || 0).toLocaleString()}`,
                    color: undefined,
                  },
                  ...(payment.targetMonth > 0 && contract.period
                    ? [{
                        label: "Qolgan oylar",
                        value: `${contract.period - payment.targetMonth} oy`,
                        color: "warning.main" as const,
                      }]
                    : []),
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.action.hover, 0.5),
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      display="block"
                      lineHeight={1.3}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={item.color || "text.primary"}
                      mt={0.4}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="text.disabled" fontStyle="italic">
                Shartnoma ma'lumotlari yuklanmadi
              </Typography>
            )}
          </Box>
        )}

        {/* ─── PENDING uchun maxsus banner ─── */}
        {isPending && (
          <Box
            sx={{
              mx: 2.5,
              mb: 2,
              p: 1.5,
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.12 : 0.07),
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.3),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <MdHourglassTop size={16} color={theme.palette.warning.main} style={{ flexShrink: 0 }} />
              <Typography variant="caption" color="warning.dark" fontWeight={600}>
                Bu to'lov kassada tasdiqlanishini kutmoqda. Kassa xodimi tasdiqlashidan so'ng holat yangilanadi.
              </Typography>
            </Stack>
          </Box>
        )}

        {/* ─── PAID uchun maxsus banner ─── */}
        {isPaid && (
          <Box
            sx={{
              mx: 2.5,
              mb: 2,
              p: 1.5,
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.12 : 0.07),
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.3),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <MdCheckCircle size={16} color={theme.palette.success.main} style={{ flexShrink: 0 }} />
              <Typography variant="caption" color="success.dark" fontWeight={600}>
                To'lov muvaffaqiyatli qabul qilindi va tasdiqlandi.
              </Typography>
            </Stack>
          </Box>
        )}

      </DialogContent>

      {/* ═══ ACTIONS ═══════════════════════════════════════════════════════ */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.action.hover, 0.3),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <MdPerson size={14} color={theme.palette.text.disabled} />
            <Typography variant="caption" color="text.disabled">
              {customerName}
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
            sx={{ minWidth: 90 }}
          >
            Yopish
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCashInfo;
