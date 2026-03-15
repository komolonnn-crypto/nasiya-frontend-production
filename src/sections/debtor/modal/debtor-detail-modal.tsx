import type { IDebt } from "@/types/debtor";

import {
  Box,
  Stack,
  Dialog,
  Typography,
  DialogContent,
  IconButton,
  Chip,
  DialogTitle,
  Divider,
  Button,
  DialogActions,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { MdClose, MdPhone } from "react-icons/md";

interface ContractInfo {
  _id: string;
  productName: string;
  totalPrice: number;
  totalPaid: number;
  remainingDebt: number;
  period: number;
  monthlyPayment: number;
  initialPayment: number;
  startDate: string;
  nextPaymentDate: string;
  delayDays: number;
}

const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

interface DebtorDetailModalProps {
  open: boolean;
  onClose: () => void;
  debtor: IDebt | null;
}

export function DebtorDetailModal({
  open,
  onClose,
  debtor,
}: DebtorDetailModalProps) {
  if (!debtor) return null;

  const contracts: ContractInfo[] = (debtor as any).contracts || [];

  const getOverdueMonthInfo = (contract: ContractInfo) => {
    if (contract.delayDays <= 0) return null;

    const nextPaymentDate =
      contract.nextPaymentDate ? new Date(contract.nextPaymentDate) : null;

    if (!nextPaymentDate) return null;

    const paidMonths =
      contract.period && contract.monthlyPayment ?
        Math.floor(
          (contract.totalPaid - contract.initialPayment) /
            contract.monthlyPayment,
        )
      : 0;

    const monthName = monthNames[nextPaymentDate.getMonth()];
    const year = nextPaymentDate.getFullYear();
    const overdueMonthNumber = paidMonths + 1;

    return {
      monthName,
      year,
      overdueMonthNumber,
      date: nextPaymentDate.toLocaleDateString("uz-UZ"),
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {debtor.fullName || "Noma'lum mijoz"}
            </Typography>
            {debtor.phoneNumber && (
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <MdPhone size={14} />
                <Typography variant="body2" color="text.secondary">
                  {debtor.phoneNumber}
                </Typography>
              </Stack>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <MdClose />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {}
        <Table size="small" sx={{ mb: 3 }}>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Umumiy narx:</strong>
              </TableCell>
              <TableCell align="right">
                ${debtor.totalPrice?.toLocaleString() || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>To'langan:</strong>
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "success.main", fontWeight: 600 }}>
                ${debtor.totalPaid?.toLocaleString() || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Qoldiq qarz:</strong>
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "error.main", fontWeight: 600 }}>
                ${debtor.remainingDebt?.toLocaleString() || 0}
              </TableCell>
            </TableRow>
            {debtor.manager && (
              <TableRow>
                <TableCell>
                  <strong>Menejer:</strong>
                </TableCell>
                <TableCell align="right">{debtor.manager}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom mt={2}>
          Shartnomalar ({contracts.length})
        </Typography>

        {contracts.length > 0 ?
          <Table size="small" sx={{ mt: 1 }}>
            <TableBody>
              <TableRow sx={{ bgcolor: "background.neutral" }}>
                <TableCell sx={{ fontWeight: 600 }}>Mahsulot</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Umumiy
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  To'langan
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Qoldiq
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Oylik
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Muddat
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Holat
                </TableCell>
              </TableRow>
              {contracts.map((contract, index) => {
                const paidMonths =
                  contract.period && contract.monthlyPayment ?
                    Math.floor(
                      (contract.totalPaid - contract.initialPayment) /
                        contract.monthlyPayment,
                    )
                  : 0;
                const overdueInfo = getOverdueMonthInfo(contract);
                const hasDelay = contract.delayDays > 0;

                return (
                  <TableRow
                    key={contract._id || index}
                    sx={{
                      bgcolor:
                        hasDelay ?
                          "rgba(var(--palette-error-mainChannel) / 0.1)"
                        : "background.paper",
                      "&:hover": {
                        bgcolor:
                          hasDelay ?
                            "rgba(var(--palette-error-mainChannel) / 0.18)"
                          : "action.hover",
                      },
                    }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {contract.productName || "Noma'lum"}
                      </Typography>
                      {overdueInfo && hasDelay && (
                        <Typography variant="caption" color="error.main">
                          ⚠️ {overdueInfo.overdueMonthNumber}-oy kechikkan
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ${contract.totalPrice?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "success.main", fontWeight: 600 }}>
                      ${contract.totalPaid?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "error.main", fontWeight: 600 }}>
                      ${contract.remainingDebt?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell align="right">
                      ${contract.monthlyPayment?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell align="right">
                      {paidMonths} / {contract.period || 0}
                    </TableCell>
                    <TableCell align="center">
                      {hasDelay ?
                        <Chip
                          label={`${contract.delayDays} kun`}
                          color="error"
                          size="small"
                        />
                      : <Chip label="Vaqtida" color="success" size="small" />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        : <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={3}>
            Shartnomalar topilmadi
          </Typography>
        }
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
