import React, { useState } from "react";

import type {
  IAuditLog,
} from "@/types/audit-log";

import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  Typography,
  Box,
  Skeleton,
  Collapse,
  IconButton,
  Paper,
} from "@mui/material";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/uz-latn";

import { Iconify } from "@/components/iconify"
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_ACTION_COLORS,
} from "@/types/audit-log";

dayjs.extend(relativeTime);
dayjs.locale("uz-latn");

const userCache: Record<string, string> = {};

function getUserDisplayName(userId: string, allLogs: IAuditLog[]): string {
  if (userCache[userId]) {
    return userCache[userId];
  }

  const userLog = allLogs.find(
    (log) =>
      typeof log.userId === "object" &&
      log.userId !== null &&
      "firstName" in log.userId &&
      ("_id" in log.userId ? log.userId._id === userId : false),
  );

  if (
    userLog &&
    typeof userLog.userId === "object" &&
    "firstName" in userLog.userId
  ) {
    const displayName = `${userLog.userId.firstName} ${userLog.userId.lastName}`;
    userCache[userId] = displayName;
    return displayName;
  }

  return "Noma'lum foydalanuvchi";
}

function getFieldLabel(field: string): string {
  const fieldLabels: Record<string, string> = {
    // To'lov maydonlari
    status: "Holat",
    isPaid: "To'langan",
    amount: "Summa",
    actualAmount: "Haqiqiy to'lov summasi",
    expectedAmount: "Kutilgan summa",
    remainingAmount: "Qolgan qarz",
    excessAmount: "Ortiqcha summa",
    prepaidBalance: "Oldindan to'langan (zapas)",
    paymentDate: "To'lov sanasi",
    targetMonth: "Necha-oylik to'lov",
    paymentStatus: "To'lov holati",
    paymentMethod: "To'lov usuli",
    paymentType: "To'lov turi",
    // Tasdiqlash / Rad etish
    confirmedBy: "Tasdiqlagan xodim",
    confirmedAt: "Tasdiqlangan vaqt",
    rejectedBy: "Rad etgan xodim",
    rejectedAt: "Rad etilgan vaqt",
    // Foydalanuvchi maydonlari
    firstName: "Ism",
    lastName: "Familiya",
    phone: "Telefon",
    phoneNumber: "Telefon raqami",
    email: "Elektron pochta",
    address: "Manzil",
    role: "Lavozim",
    password: "Parol",
    isDeleted: "O'chirilgan",
    // Shartnoma maydonlari
    totalPrice: "Umumiy summa",
    monthlyPayment: "Oylik to'lov",
    contractDate: "Shartnoma sanasi",
    startDate: "Boshlanish sanasi",
    endDate: "Tugash sanasi",
    period: "Muddat (oy)",
    productName: "Mahsulot nomi",
    initialPayment: "Boshlang'ich to'lov",
    contractStatus: "Shartnoma holati",
    notes: "Izoh",
    // Vaqt maydonlari
    createdAt: "Yaratilgan vaqt",
    updatedAt: "Yangilangan vaqt",
    // Holat qiymatlari
    PENDING: "Kutilmoqda",
    PAID: "To'liq to'langan",
    REJECTED: "Rad etilgan",
    UNDERPAID: "Kam to'langan",
    OVERPAID: "Ortiqcha to'langan",
    COMPLETED: "Tugallangan",
    ACTIVE: "Faol",
    // To'lov turi qiymatlari
    monthly: "Oylik",
    initial: "Boshlang'ich",
    // Mantiqiy qiymatlar
    true: "Ha",
    false: "Yo'q",
  };

  return fieldLabels[field] || field;
}

function formatFieldValue(
  value: any,
  fieldName?: string,
  allLogs?: IAuditLog[],
): string {
  if (value === null || value === undefined) return "-";
  if (value === true) return "Ha";
  if (value === false) return "Yo'q";

  // To'lov holati qiymatlari
  if (value === "PENDING") return "Kutilmoqda";
  if (value === "PAID") return "To'liq to'langan";
  if (value === "UNDERPAID") return "Kam to'langan";
  if (value === "OVERPAID") return "Ortiqcha to'langan";
  if (value === "REJECTED") return "Rad etilgan";
  if (value === "COMPLETED") return "Tugallangan";
  if (value === "ACTIVE") return "Faol";

  // To'lov turi qiymatlari
  if (value === "monthly") return "Oylik";
  if (value === "initial") return "Boshlang'ich";

  // To'lov usuli qiymatlari
  if (value === "som_cash") return "So'm naqd";
  if (value === "som_card") return "So'm karta";
  if (value === "dollar_cash") return "Dollar naqd";
  if (value === "dollar_card_visa") return "Dollar karta (Visa)";

  if (
    typeof value === "object" &&
    value !== null &&
    value.firstName &&
    value.lastName
  ) {
    return `${value.firstName} ${value.lastName}`;
  }

  if (
    typeof value === "string" &&
    value.match(/^[0-9a-fA-F]{24}$/) &&
    (fieldName === "confirmedBy" ||
      fieldName === "rejectedBy" ||
      fieldName === "userId")
  ) {
    if (allLogs && allLogs.length > 0) {
      return getUserDisplayName(value, allLogs);
    }
    return "Tasdiqlangan";
  }

  if (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  ) {
    return dayjs(value).format("DD.MM.YYYY HH:mm");
  }

  return String(value);
}

interface ExpandedRowProps {
  log: IAuditLog;
  allLogs: IAuditLog[];
}

function ExpandedRow({ log, allLogs }: ExpandedRowProps) {
  // Ortiqcha o'zgarishlarni filter qilish
  const redundantFields = ["status", "isPaid", "confirmedBy", "confirmedAt"];

  const meaningfulChanges =
    log.changes?.filter((change) => {
      if (log.action === "CONFIRM" || log.action === "REJECT") {
        return !redundantFields.includes(change.field);
      }
      return true;
    }) || [];

  const isPaymentAction = log.action === "CONFIRM" || log.action === "REJECT";

  return (
    <Box sx={{ p: 0.5, bgcolor: "background.neutral", borderRadius: 0 }}>
      <Stack spacing={0.5}>
        {/* To'lov tasdiqlash/rad etish uchun sodda ko'rinish */}
        {isPaymentAction && (
          <Paper
            sx={{
              p: 1,
              bgcolor: "background.default",
              border: "none",
              boxShadow: "none",
            }}
          >
            <Stack spacing={0.5}>
              {log.action === "CONFIRM" && (
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={600}
                >
                  Tasdiqlangan: {log.userId.firstName} {log.userId.lastName}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({dayjs(log.timestamp).format("DD.MM.YYYY HH:mm")})
                  </Typography>
                </Typography>
              )}
              {log.action === "REJECT" && (
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  Rad etilgan: {log.userId.firstName} {log.userId.lastName}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({dayjs(log.timestamp).format("DD.MM.YYYY HH:mm")})
                  </Typography>
                </Typography>
              )}
              {log.metadata?.amount && (
                <Typography variant="body2">
                  Summa: <strong>${log.metadata.amount}</strong>
                  {log.metadata.targetMonth && (
                    <span style={{ color: "inherit", opacity: 0.6, marginLeft: 8 }}>
                      ({log.metadata.targetMonth}-oy)
                    </span>
                  )}
                </Typography>
              )}
              {log.metadata?.customerName && (
                <Typography variant="body2" color="text.secondary">
                  Mijoz: {log.metadata.customerName}
                </Typography>
              )}
              {/* ✅ YANGI: To'lovni qilgan xodim */}
              {log.metadata?.paymentCreatorName && (
                <Typography variant="body2" color="primary.main">
                  Xodim: <strong>{log.metadata.paymentCreatorName}</strong>
                </Typography>
              )}
              {/* ✅ YANGI: To'lov usuli */}
              {log.metadata?.paymentMethod && (
                <Typography variant="body2" color="text.secondary">
                  To'lov usuli:{" "}
                  <Chip
                    label={
                      log.metadata.paymentMethod === "som_cash"
                        ? "So'm naqd"
                        : log.metadata.paymentMethod === "som_card"
                          ? "So'm karta"
                          : log.metadata.paymentMethod === "dollar_cash"
                            ? "Dollar naqd"
                            : log.metadata.paymentMethod === "dollar_card_visa"
                              ? "Dollar karta (Visa)"
                              : log.metadata.paymentMethod
                    }
                    size="small"
                    color={
                      log.metadata.paymentMethod === "som_cash"
                        ? "success"
                        : log.metadata.paymentMethod === "som_card"
                          ? "primary"
                          : log.metadata.paymentMethod === "dollar_cash"
                            ? "warning"
                            : log.metadata.paymentMethod === "dollar_card_visa"
                              ? "info"
                              : "default"
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

        {/* Boshqa actionlar uchun o'zgarishlar */}
        {!isPaymentAction && meaningfulChanges.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              O'zgarishlar:
            </Typography>
            <Stack spacing={1}>
              {meaningfulChanges.map((change, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 1,
                    bgcolor: "background.default",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>{getFieldLabel(change.field)}</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={formatFieldValue(
                          change.oldValue,
                          change.field,
                          allLogs,
                        )}
                        color="default"
                        variant="outlined"
                      />
                      <Iconify icon="eva:arrow-forward-fill" width={16} />
                      <Chip
                        size="small"
                        label={formatFieldValue(
                          change.newValue,
                          change.field,
                          allLogs,
                        )}
                        color="primary"
                        variant="filled"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Boshqa actionlar uchun metadata (to'lov uchun emas) */}
        {!isPaymentAction && log.metadata && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Qo'shimcha:
            </Typography>
            <Paper
              sx={{
                p: 1,
                bgcolor: "background.default",
                border: "none",
                boxShadow: "none",
              }}
            >
              <Stack spacing={0.5}>
                {log.metadata.fileName && (
                  <Typography variant="caption">
                    <strong>Excel fayl:</strong>{" "}
                    {log.metadata.fileName
                      .replace(/^.*[\\/]/, "")
                      .replace(/excel-\d+-\d+\./, "")}
                  </Typography>
                )}

                {log.metadata.totalRows && (
                  <Typography variant="caption">
                    <strong>Import:</strong> {log.metadata.successfulRows}/
                    {log.metadata.totalRows} muvaffaqiyatli
                    {log.metadata.failedRows && log.metadata.failedRows > 0 && (
                      <span style={{ color: "var(--palette-error-main)", marginLeft: 8 }}>
                        ({log.metadata.failedRows} xato)
                      </span>
                    )}
                  </Typography>
                )}

                {log.metadata.totalPrice && (
                  <Typography variant="caption">
                    <strong>Shartnoma summasi:</strong> $
                    {log.metadata.totalPrice}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

interface AuditLogTableProps {
  data: IAuditLog[];
  loading: boolean;
  title?: string;
  subtitle?: string;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onLimitChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxHeight?: string;
}

export default function AuditLogTable({
  data,
  loading,
  title = "Audit Log",
  page = 1,
  limit = 100,
  total = 0,
  onPageChange,
  onLimitChange,
  maxHeight = "600px",
}: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleExpandRow = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getActionIcon = (action: string, _entity: string) => {
    switch (action) {
      case "CREATE":
        return "eva:plus-circle-fill";
      case "UPDATE":
        return "eva:edit-2-fill";
      case "DELETE":
        return "eva:trash-2-fill";
      case "PAYMENT":
        return "eva:credit-card-fill";
      case "BULK_IMPORT":
        return "eva:cloud-upload-fill";
      case "LOGIN":
        return "eva:log-in-fill";
      case "LOGOUT":
        return "eva:log-out-fill";
      case "CONFIRM":
        return "eva:checkmark-circle-2-fill";
      case "REJECT":
        return "eva:close-circle-fill";
      default:
        return "eva:activity-fill";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const formatEntityName = (log: IAuditLog) => {
  //   // To'lov uchun - mijoz ismi (qisqartirilgan)
  //   if (log.entity === "payment" && log.metadata?.customerName) {
  //     const name = log.metadata.customerName;
  //     // Agar 10 belgidan uzun bo'lsa, qisqartirish
  //     return name.length > 10 ? name.substring(0, 10) + "..." : name;
  //   }

  //   // affectedEntities'dan olish (qisqartirilgan)
  //   if (
  //     log.metadata?.affectedEntities &&
  //     log.metadata.affectedEntities.length > 0
  //   ) {
  //     const entityName = log.metadata.affectedEntities[0]?.entityName || "-";
  //     // Agar 10 belgidan uzun bo'lsa, qisqartirish
  //     return entityName.length > 10
  //       ? entityName.substring(0, 10) + "..."
  //       : entityName;
  //   }

  //   // ObjectId'ni ko'rsatmaslik
  //   if (log.entityId && log.entityId.match(/^[0-9a-fA-F]{24}$/)) {
  //     return "-";
  //   }

  //   return log.entityId || "-";
  // };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const formatAmountInfo = (log: IAuditLog) => {
  //   if (log.entity === "payment" && log.metadata?.amount) {
  //     const paidAmount = log.metadata.amount;
  //     const status = log.metadata.paymentStatus;
  //     const targetMonth = log.metadata.targetMonth;
  //     let statusText = "";
  //     let statusColor: "success" | "warning" | "error" | "info" = "info";
  //     let amountColor = "success.main";

  //     if (status === "UNDERPAID") {
  //       statusText = "Kam to'lov";
  //       statusColor = "warning";
  //       amountColor = "warning.main";
  //     } else if (status === "OVERPAID") {
  //       statusText = "Ortiqcha to'lov";
  //       statusColor = "info";
  //       amountColor = "info.main";
  //     } else if (status === "PAID") {
  //       statusText = "To'liq to'lov";
  //       statusColor = "success";
  //       amountColor = "success.main";
  //     } else if (status === "REJECTED") {
  //       statusText = "Rad etilgan";
  //       statusColor = "error";
  //       amountColor = "error.main";
  //     } else if (status === "PENDING") {
  //       statusText = "Kutilmoqda";
  //       statusColor = "warning";
  //       amountColor = "warning.main";
  //     } else {
  //       statusText = "To'lov";
  //       statusColor = "info";
  //     }

  //     return (
  //       <Stack spacing={0.5}>
  //         <Typography
  //           variant="subtitle2"
  //           color={amountColor}
  //           sx={{ fontWeight: 600 }}
  //         >
  //           ${paidAmount}
  //         </Typography>
  //         {targetMonth && (
  //           <Typography variant="caption" color="text.secondary">
  //             {targetMonth}-oy uchun
  //           </Typography>
  //         )}
  //         {/* Faqat muhim statuslar uchun chip ko'rsatamiz */}
  //         {(status === "UNDERPAID" ||
  //           status === "OVERPAID" ||
  //           status === "REJECTED") && (
  //           <Chip
  //             size="small"
  //             label={statusText}
  //             color={statusColor}
  //             variant="filled"
  //             sx={{
  //               fontSize: "0.7rem",
  //               height: 20,
  //               fontWeight: 500,
  //             }}
  //           />
  //         )}
  //       </Stack>
  //     );
  //   }

  //   // Excel import uchun
  //   if (log.action === "BULK_IMPORT" && log.metadata?.totalRows) {
  //     return (
  //       <Stack spacing={0.5}>
  //         <Typography variant="subtitle2" color="primary.main">
  //           {log.metadata.successfulRows}/{log.metadata.totalRows}
  //         </Typography>
  //         <Typography variant="caption" color="text.secondary">
  //           Muvaffaqiyatli
  //         </Typography>
  //       </Stack>
  //     );
  //   }

  //   // Contract uchun
  //   if (log.entity === "contract" && log.metadata?.totalPrice) {
  //     return (
  //       <Stack spacing={0.5}>
  //         <Typography variant="subtitle2" color="warning.main">
  //           ${log.metadata.totalPrice}
  //         </Typography>
  //         <Typography variant="caption" color="text.secondary">
  //           Shartnoma
  //         </Typography>
  //       </Stack>
  //     );
  //   }

  //   // Changes count for updates
  //   if (log.changes && log.changes.length > 0) {
  //     return (
  //       <Stack spacing={0.5}>
  //         <Typography variant="subtitle2" color="info.main">
  //           {log.changes.length}
  //         </Typography>
  //         <Typography variant="caption" color="text.secondary">
  //           O'zgarish
  //         </Typography>
  //       </Stack>
  //     );
  //   }

  //   return (
  //     <Typography variant="body2" color="text.secondary">
  //       -
  //     </Typography>
  //   );
  // };

  return (
    <Card sx={{ boxShadow: 1, margin: 2 ,borderRadius: "18px"}}>
      {title && (
        <CardHeader
          sx={{ py: 1, px: 3 }}
          title={title}
          titleTypographyProps={{
            variant: "body2",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
          action={
            !loading && (
              <Typography
                variant="caption"
                color="text.primary"
                fontSize="0.875rem"
                fontWeight={700}
              >
                {total || data.length}
              </Typography>
            )
          }
        />
      )}

      <CardContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight, border: "none" }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                py: 0.2,
                px: 0.5,
                fontSize: "0.6rem",
                lineHeight: 1.1,
                borderBottom: "1px solid",
                borderColor: "divider",
                height: "22px",
              },
              "& .MuiTableCell-head": {
                boxShadow: "none !important",
                py: 0.3,
                fontWeight: 600,
                fontSize: "0.6rem",
                bgcolor: "background.neutral",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell width={25}></TableCell>
                <TableCell>Xodim</TableCell>
                <TableCell>Harakat</TableCell>
                <TableCell>Bo'lim</TableCell>
                <TableCell>Shartnoma ID</TableCell>
                {/* <TableCell>Obyekt</TableCell> */}
                <TableCell>Mijoz</TableCell>
                <TableCell>Xodim</TableCell>
                <TableCell>Summa</TableCell>
                <TableCell>Kun</TableCell>
                <TableCell>Soat</TableCell>
                <TableCell width={30}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Stack spacing={1} alignItems="center">
                      <Iconify
                        icon="eva:file-text-outline"
                        width={48}
                        sx={{ color: "text.disabled" }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        Ma'lumotlar topilmadi
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log) => {
                  const isExpanded = expandedRows.has(log._id);
                  const hasDetails =
                    log.changes?.length || log.metadata || log.ipAddress;

                  return (
                    <React.Fragment key={log._id}>
                      <TableRow
                        hover
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <TableCell>
                          <Iconify
                            icon={getActionIcon(log.action, log.entity)}
                            width={12}
                            sx={{
                              color: `${AUDIT_ACTION_COLORS[log.action] || "default"}.main`,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ maxWidth: 80, fontSize: "0.6rem" }}
                          >
                            {log.userId.firstName} {log.userId.lastName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {AUDIT_ACTION_LABELS[log.action] || log.action}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {AUDIT_ENTITY_LABELS[log.entity] || log.entity}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {(log as any).contractId ? (
                            <Chip
                              label={(log as any).contractId}
                              size="small"
                              variant="filled"
                              color="info"
                              sx={{ fontSize: "0.6rem", height: 18 }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.6rem" }}
                            >
                              {log.metadata?.paymentCreatorId || "-"}
                            </Typography>
                          )}
                        </TableCell>

                        {/* <TableCell>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 50, fontSize: '0.6rem' }}>
                            {formatEntityName(log)}
                          </Typography>
                        </TableCell> */}

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ maxWidth: 70, fontSize: "0.6rem" }}
                          >
                            {`${log.metadata?.customerName || "-"} - ${dayjs(log.createdAt).format("DD/MM/YYYY")}`}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ maxWidth: 70, fontSize: "0.6rem" }}
                          >
                            {log.metadata?.paymentCreatorName || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {log.metadata?.amount
                              ? `$${log.metadata.amount}`
                              : "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {dayjs(log.timestamp).format("DD.MM.YY")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {dayjs(log.timestamp).format("HH:mm")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {hasDetails && (
                            <IconButton
                              size="small"
                              onClick={() => handleExpandRow(log._id)}
                            >
                              <Iconify
                                icon={
                                  isExpanded
                                    ? "eva:chevron-up-fill"
                                    : "eva:chevron-down-fill"
                                }
                                width={20}
                              />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded row */}
                      {hasDetails && isExpanded && (
                        <TableRow sx={{ height: "auto" }}>
                          <TableCell
                            colSpan={11}
                            sx={{ p: 0, borderBottom: 0 }}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <ExpandedRow log={log} allLogs={data} />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {onPageChange && onLimitChange && (
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200, 500]}
            component="div"
            count={total}
            rowsPerPage={limit}
            page={page - 1} // MUI uses 0-based indexing
            onPageChange={onPageChange}
            onRowsPerPageChange={onLimitChange}
            labelRowsPerPage="Sahifada:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `ko'proq ${to}`}`
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
