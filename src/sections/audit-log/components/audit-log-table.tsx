import React, { useState } from "react";

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
import { alpha, useTheme } from "@mui/material/styles";

import { Iconify } from "@/components/iconify";

import {
  formatDdMmYyyyHhMmSsTashkent,
  formatDdMmYyyyTashkent,
  formatHhMmSsTashkent,
} from "@/utils/format-payment-date-tashkent";

import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_ACTION_COLORS,
  AuditAction,
  rows,
  headers,
} from "@/types/auditlog-page-types";
import { tableEmptyUz } from "@/utils/table-empty-labels";
import type {
  AuditLogTableProps,
  ExpandedRowProps,
  IAuditLog,
} from "@/types/auditlog-page-types";

const userCache: Record<string, string | undefined> = {};

function formatAmount(value: number | undefined | null): string {
  if (value == null) return "0";
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
}

function auditLogNumericAmount(log: IAuditLog): number | null {
  const m = log.metadata;
  if (!m) return null;
  const raw = m.amount ?? m.totalPrice ?? m.dollar ?? m.sum;
  if (raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function AuditMissing({ text }: { text: string }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontSize: "0.65rem",
        fontStyle: "italic",
        textAlign: "center",
        display: "block",
        px: 0.5,
        lineHeight: 1.3,
      }}>
      {text}
    </Typography>
  );
}

function getUserDisplayName(userId: string, allLogs: IAuditLog[]): string {
  if (!userId) return "Noma'lum foydalanuvchi";

  if (userCache[userId]) {
    return userCache[userId] || "Noma'lum foydalanuvchi";
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
    confirmedBy: "Tasdiqlagan xodim",
    confirmedAt: "Tasdiqlangan vaqt",
    rejectedBy: "Rad etgan xodim",
    rejectedAt: "Rad etilgan vaqt",
    firstName: "Ism",
    lastName: "Familiya",
    phone: "Telefon",
    phoneNumber: "Telefon raqami",
    email: "Elektron pochta",
    address: "Manzil",
    role: "Lavozim",
    password: "Parol",
    isDeleted: "O'chirilgan",
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
    createdAt: "Yaratilgan vaqt",
    updatedAt: "Yangilangan vaqt",
    PENDING: "Kutilmoqda",
    PAID: "To'liq to'langan",
    REJECTED: "Rad etilgan",
    UNDERPAID: "Kam to'langan",
    OVERPAID: "Ortiqcha to'langan",
    COMPLETED: "Tugallangan",
    ACTIVE: "Faol",
    monthly: "Oylik",
    initial: "Boshlang'ich",
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
  if (value === null || value === undefined) return tableEmptyUz.generic;
  if (value === true) return "Ha";
  if (value === false) return "Yo'q";

  if (value === "PENDING") return "Kutilmoqda";
  if (value === "PAID") return "To'liq to'langan";
  if (value === "UNDERPAID") return "Kam to'langan";
  if (value === "OVERPAID") return "Ortiqcha to'langan";
  if (value === "REJECTED") return "Rad etilgan";
  if (value === "COMPLETED") return "Tugallangan";
  if (value === "ACTIVE") return "Faol";

  if (value === "monthly") return "Oylik";
  if (value === "initial") return "Boshlang'ich";

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
    return formatDdMmYyyyHhMmSsTashkent(value);
  }

  return String(value);
}

function ExpandedRow({ log, allLogs }: ExpandedRowProps) {
  const redundantFields = ["status", "isPaid", "confirmedBy", "confirmedAt"];

  const meaningfulChanges =
    log.changes?.filter((change) => {
      if (log.action === "CONFIRM" || log.action === "REJECT") {
        return !redundantFields.includes(change.field);
      }
      return true;
    }) || [];

  const isPaymentAction = log.action === "CONFIRM" || log.action === "REJECT";

  const actorName = (() => {
    const u = log.userId as unknown;
    if (
      u &&
      typeof u === "object" &&
      u !== null &&
      "firstName" in u &&
      (u as { firstName?: string }).firstName
    ) {
      return `${(u as { firstName: string }).firstName} ${(u as { lastName?: string }).lastName || ""}`.trim();
    }
    return "Noma'lum xodim";
  })();

  return (
    <Box sx={{ p: 0.5, bgcolor: "background.neutral", borderRadius: 0 }}>
      <Stack spacing={0.5}>
        {}
        {isPaymentAction && (
          <Paper
            sx={{
              p: 1,
              bgcolor: "background.default",
              border: "none",
              boxShadow: "none",
            }}>
            <Stack spacing={1}>
              {log.action === "CONFIRM" && (
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={600}>
                  Tasdiqlangan: {actorName}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}>
                    ({formatDdMmYyyyHhMmSsTashkent(log.timestamp)})
                  </Typography>
                </Typography>
              )}
              {log.action === "REJECT" && (
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  Rad etilgan: {actorName}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}>
                    ({formatDdMmYyyyHhMmSsTashkent(log.timestamp)})
                  </Typography>
                </Typography>
              )}
              {log.metadata?.amount && (
                <Typography variant="body2">
                  Summa: <strong>${formatAmount(log.metadata.amount)}</strong>
                  {log.metadata.targetMonth != null &&
                    log.metadata.targetMonth > 0 && (
                      <span
                        style={{
                          color: "inherit",
                          opacity: 0.6,
                          marginLeft: 8,
                        }}>
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

              {log.metadata?.paymentCreatorName && (
                <Typography variant="body2" color="primary.main">
                  Xodim: <strong>{log.metadata.paymentCreatorName}</strong>
                </Typography>
              )}

              {log.metadata?.paymentMethod && (
                <Typography variant="body2" color="text.secondary">
                  To'lov usuli:{" "}
                  <Chip
                    label={
                      log.metadata.paymentMethod === "som_cash" ? "So'm naqd"
                      : log.metadata.paymentMethod === "som_card" ?
                        "So'm karta"
                      : log.metadata.paymentMethod === "dollar_cash" ?
                        "Dollar naqd"
                      : log.metadata.paymentMethod === "dollar_card_visa" ?
                        "Dollar karta (Visa)"
                      : log.metadata.paymentMethod
                    }
                    size="small"
                    color={
                      log.metadata.paymentMethod === "som_cash" ? "success"
                      : log.metadata.paymentMethod === "som_card" ?
                        "primary"
                      : log.metadata.paymentMethod === "dollar_cash" ?
                        "warning"
                      : log.metadata.paymentMethod === "dollar_card_visa" ?
                        "info"
                      : "default"
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
              )}

              {log.metadata?.excessAmount && log.metadata.excessAmount > 0 && (
                <Box
                  sx={{
                    mt: 0.5,
                    p: 0.75,
                    px: 1,
                    py: 1,
                    borderRadius: "10px",
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.warning.main, 0.4),
                  }}>
                  <Typography variant="body2" color="green" fontWeight={600}>
                    Ko'p to'langan (zapasga o'tkazildi)
                  </Typography>
                  <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                    <Typography variant="caption" color="text.main">
                      To'langan:{" "}
                      <strong>
                        ${formatAmount(log.metadata.originalAmount)}
                      </strong>{" "}
                      = Qabul:{" "}
                      <strong>${formatAmount(log.metadata.amount)}</strong> +
                      Zapas:{" "}
                      <strong style={{ color: "inherit" }}>
                        ${formatAmount(log.metadata.excessAmount)}
                      </strong>
                    </Typography>
                    {log.metadata.prepaidRecordId && (
                      <Typography variant="button" color="red">
                        Zapas ID: {log.metadata.prepaidRecordId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        )}

        {}
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
                  }}>
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

        {}
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
              }}>
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
                      <span
                        style={{
                          color: "var(--palette-error-main)",
                          marginLeft: 8,
                        }}>
                        ({log.metadata.failedRows} xato)
                      </span>
                    )}
                  </Typography>
                )}

                {log.metadata.totalPrice && (
                  <Typography variant="caption">
                    <strong>Shartnoma summasi:</strong> $
                    {formatAmount(log.metadata.totalPrice)}
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
  const theme = useTheme();
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

  return (
    <Card sx={{ boxShadow: 1, margin: 2, borderRadius: "18px" }}>
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
                fontWeight={700}>
                {total || data.length}
              </Typography>
            )
          }
        />
      )}

      <CardContent sx={{ p: 0 }}>
        {}
        <TableContainer
          sx={{
            maxHeight,
            border: "none",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(128,128,128,0.35) transparent",
            "&::-webkit-scrollbar": { width: "5px", height: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(128,128,128,0.35)",
              borderRadius: "10px",
              "&:hover": { backgroundColor: "rgba(128,128,128,0.6)" },
            },
            "&::-webkit-scrollbar-corner": { background: "transparent" },
          }}>
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
            }}>
            {}
            <TableHead>
              <TableRow>
                {headers.map((item, index) => (
                  <TableCell
                    key={index}
                    width={item.width}
                    align={item.align || "center"}>
                    {item.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            {}

            <TableBody>
              {loading ?
                Array.from({ length: rows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {headers.map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data.length === 0 ?
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
              : data.map((log) => {
                  const isExpanded = expandedRows.has(log._id);
                  const hasDetails =
                    log.changes?.length || log.metadata || log.ipAddress;

                  const cells = [
                    {
                      key: "icon",
                      render: (log: IAuditLog) => {
                        const key =
                          AUDIT_ACTION_COLORS[log.action as AuditAction] ??
                          "primary";
                        const palette = theme.palette as Record<
                          string,
                          { main?: string } | undefined
                        >;
                        const iconColor =
                          key === "default" ?
                            theme.palette.text.secondary
                          : palette[key]?.main ?? theme.palette.primary.main;
                        return (
                          <Iconify
                            icon={getActionIcon(log.action, log.entity)}
                            width={20}
                            sx={{ color: iconColor }}
                          />
                        );
                      },
                    },
                    {
                      key: "user",
                      render: (log: IAuditLog) => {
                        const u = log.userId as unknown;
                        const name =
                          u &&
                          typeof u === "object" &&
                          u !== null &&
                          "firstName" in u &&
                          (u as { firstName?: string }).firstName ?
                            `${(u as { firstName: string }).firstName} ${(u as { lastName?: string }).lastName || ""}`.trim()
                          : null;
                        return name ?
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                maxWidth: 100,
                                fontSize: "0.6rem",
                                textAlign: "center",
                              }}>
                              {name}
                            </Typography>
                          : <AuditMissing text="Xodim: ma'lumot yo'q" />;
                      },
                    },
                    {
                      key: "action",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                          {AUDIT_ACTION_LABELS[log.action] || log.action}
                        </Typography>
                      ),
                    },
                    {
                      key: "entity",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                          {AUDIT_ENTITY_LABELS[log.entity] || log.entity}
                        </Typography>
                      ),
                    },
                    {
                      key: "contractDisplayId",
                      render: (log: IAuditLog) => {
                        const id =
                          typeof log.contractId === "string" ?
                            log.contractId.trim()
                          : "";
                        if (id) {
                          return (
                            <Chip
                              label={id}
                              size="small"
                              variant="outlined"
                              color="primary"
                              title={id}
                              sx={{
                                fontSize: "0.65rem",
                                height: 22,
                                maxWidth: 110,
                                "& .MuiChip-label": {
                                  px: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            />
                          );
                        }
                        if (log.entity === "contract") {
                          return (
                            <AuditMissing text="Shartnoma ID kiritilmagan" />
                          );
                        }
                        return (
                          <AuditMissing text="Ushbu yozuv uchun shartnoma ID yo'q" />
                        );
                      },
                    },
                    {
                      key: "customer",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            maxWidth: 70,
                            fontSize: "0.6rem",
                            textAlign: "center",
                          }}>
                          {log.metadata?.customerName ?
                            `${log.metadata.customerName}`
                          : <AuditMissing text="Mijoz nomi yo'q" />}
                        </Typography>
                      ),
                    },
                    {
                      key: "managerOrCreator",
                      render: (log: IAuditLog) => {
                        const name =
                          log.metadata?.managerName ||
                          log.metadata?.paymentCreatorName;
                        return name ?
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                maxWidth: 96,
                                fontSize: "0.6rem",
                                textAlign: "center",
                              }}>
                              {name}
                            </Typography>
                          : <AuditMissing text="Menejer: ma'lumot yo'q" />;
                      },
                    },
                    {
                      key: "amount",
                      render: (log: IAuditLog) => {
                        const n = auditLogNumericAmount(log);
                        return (
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                            {n != null ?
                              `$${formatAmount(n)}`
                            : <AuditMissing text="Summasi yo'q" />}
                          </Typography>
                        );
                      },
                    },
                    {
                      key: "date",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                          {formatDdMmYyyyTashkent(log?.timestamp)}
                        </Typography>
                      ),
                    },
                    {
                      key: "time",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem", textAlign: "center" }}>
                          {formatHhMmSsTashkent(log.timestamp)}
                        </Typography>
                      ),
                    },
                    {
                      key: "actions",
                      render: (log: IAuditLog) =>
                        hasDetails && (
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRow(log._id)}>
                            <Iconify
                              icon={
                                isExpanded ?
                                  "eva:chevron-up-fill"
                                : "eva:chevron-down-fill"
                              }
                              width={23}
                            />
                          </IconButton>
                        ),
                    },
                  ];

                  return (
                    <React.Fragment key={log._id}>
                      <TableRow
                        hover
                        sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                        {cells.map((cell) => (
                          <TableCell key={cell.key} align="center">
                            {cell.render(log)}
                          </TableCell>
                        ))}
                      </TableRow>

                      {}
                      {hasDetails && isExpanded && (
                        <TableRow sx={{ height: "auto" }}>
                          <TableCell
                            colSpan={11}
                            sx={{ p: 0, borderBottom: 0 }}>
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit>
                              <ExpandedRow log={log} allLogs={data} />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        {}

        {}
        {onPageChange && onLimitChange && (
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200, 500]}
            component="div"
            count={total}
            rowsPerPage={limit}
            page={page - 1}
            onPageChange={onPageChange}
            onRowsPerPageChange={onLimitChange}
            labelRowsPerPage="Sahifada:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `ko'proq ${to}`}`
            }
          />
        )}
        {}
      </CardContent>
    </Card>
  );
}
