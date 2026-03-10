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

import relativeTime from "dayjs/plugin/relativeTime";
import { Iconify } from "@/components/iconify";
import "dayjs/locale/uz-latn";
import dayjs from "dayjs";

import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_ACTION_COLORS,
  rows,
  headers,
} from "@/types/auditlog-page-types";
import type {
  AuditLogTableProps,
  ExpandedRowProps,
  IAuditLog,
} from "@/types/auditlog-page-types";

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
            }}>
            <Stack spacing={0.5}>
              {log.action === "CONFIRM" && (
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={600}>
                  Tasdiqlangan: {log.userId.firstName} {log.userId.lastName}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}>
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
                    sx={{ ml: 1 }}>
                    ({dayjs(log.timestamp).format("DD.MM.YYYY HH:mm")})
                  </Typography>
                </Typography>
              )}
              {log.metadata?.amount && (
                <Typography variant="body2">
                  Summa: <strong>${log.metadata.amount}</strong>
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
        {/* TableContainer render start */}
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
            }}>
            {/* Jadvalni boshini render qiladi start */}
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
            {/* Jadvalni boshini render qiladi end */}

            <TableBody>
              {loading ?
                // Loading skeleton start
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
                // No data
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
                // Data rows
              : data.map((log) => {
                  const isExpanded = expandedRows.has(log._id);
                  const hasDetails =
                    log.changes?.length || log.metadata || log.ipAddress;

                  // Cells start
                  const cells = [
                    {
                      key: "icon",
                      render: (log: IAuditLog) => (
                        <Iconify
                          icon={getActionIcon(log.action, log.entity)}
                          width={20}
                          sx={{
                            color: `${AUDIT_ACTION_COLORS[log.action] || "default"}.main`,
                          }}
                        />
                      ),
                    },
                    {
                      key: "user",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            maxWidth: 80,
                            fontSize: "0.6rem",
                            textAlign: "center",
                          }}>
                          {log.userId.firstName} {log.userId.lastName}
                        </Typography>
                      ),
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
                      key: "contractId",
                      render: (log: IAuditLog) =>
                        log.contractId ?
                          <Chip
                            label={log.contractId}
                            size="small"
                            variant="filled"
                            color="info"
                            sx={{ fontSize: "0.6rem", height: 20 }}
                          />
                        : <Typography
                            variant="caption"
                            sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                            ID mavjud emas
                          </Typography>,
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
                          {`${log.metadata?.customerName || "———"}`}
                        </Typography>
                      ),
                    },
                    {
                      key: "paymentCreator",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            maxWidth: 70,
                            fontSize: "0.6rem",
                            textAlign: "center",
                          }}>
                          {log.metadata?.paymentCreatorName || "———"}
                        </Typography>
                      ),
                    },
                    {
                      key: "amount",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                          {log.metadata?.amount ?
                            `$${log.metadata.amount}`
                          : "———"}
                        </Typography>
                      ),
                    },
                    {
                      key: "date",
                      render: (log: IAuditLog) => (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem", textAlign: "center" }}>
                          {dayjs(log?.timestamp).format("DD.MM.YY")}
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
                          {dayjs(log.timestamp).format("HH:mm")}
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
                  // Cells end

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

                      {/* Expanded row */}
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
        {/* TableContainer render end */}

        {/* Pagination render start */}
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
        {/* Pagination render end */}
      </CardContent>
    </Card>
  );
}
