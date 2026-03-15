import type { IContract } from "@/types/contract";

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
import { MdClose } from "react-icons/md";

interface ContractDetailModalProps {
  open: boolean;
  onClose: () => void;
  contract: IContract | null;
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

export function ContractDetailModal({
  open,
  onClose,
  contract,
}: ContractDetailModalProps) {
  if (!contract) return null;

  const delayDays = (contract as any).delayDays || 0;
  const hasDelay = delayDays > 0;

  const paidMonths =
    contract.period && contract.monthlyPayment ?
      Math.floor(
        (contract.totalPaid - contract.initialPayment) /
          contract.monthlyPayment,
      )
    : 0;

  const getOverdueMonthInfo = () => {
    if (delayDays <= 0) return null;

    const nextPaymentDate =
      contract.nextPaymentDate ? new Date(contract.nextPaymentDate) : null;

    if (!nextPaymentDate) return null;

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

  const overdueInfo = getOverdueMonthInfo();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {contract.productName || "Noma'lum mahsulot"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(contract as any).fullName || "Mijoz noma'lum"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {hasDelay && (
              <Chip
                label={`${delayDays} kun kechikish`}
                color="error"
                size="small"
              />
            )}
            <IconButton onClick={onClose} size="small">
              <MdClose />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {overdueInfo && hasDelay && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: "error.main",
              color: "white",
              borderRadius: 0,
            }}>
            <Typography variant="body2" fontWeight={600}>
              ⚠️ {overdueInfo.overdueMonthNumber}-oy to'lovi kechikkan
            </Typography>
            <Typography variant="caption">
              {overdueInfo.monthName} {overdueInfo.year} • {overdueInfo.date}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={3}>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Moliyaviy ma'lumotlar
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Umumiy narx:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${contract.totalPrice?.toLocaleString() || 0}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    bgcolor: "rgba(var(--palette-success-mainChannel) / 0.1)",
                  }}>
                  <TableCell>To'langan:</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "success.main", fontWeight: 600 }}>
                    ${contract.totalPaid?.toLocaleString() || 0}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    bgcolor: "rgba(var(--palette-error-mainChannel) / 0.1)",
                  }}>
                  <TableCell>Qoldiq qarz:</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "error.main", fontWeight: 600 }}>
                    ${contract.remainingDebt?.toLocaleString() || 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Oldindan to'lov:</TableCell>
                  <TableCell align="right">
                    ${contract.initialPayment?.toLocaleString() || 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Oylik to'lov:</TableCell>
                  <TableCell align="right">
                    ${contract.monthlyPayment?.toLocaleString() || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Shartnoma ma'lumotlari
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Muddat:</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      <Box
                        component="span"
                        sx={{ color: "primary.main", fontWeight: 600 }}>
                        {paidMonths}
                      </Box>
                      {" / "}
                      {contract.period || 0} oy
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shartnoma sanasi:</TableCell>
                  <TableCell align="right">
                    {contract.startDate ?
                      new Date(contract.startDate).toLocaleDateString("uz-UZ")
                    : "—"}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    bgcolor:
                      hasDelay ?
                        "rgba(var(--palette-error-mainChannel) / 0.1)"
                      : "background.paper",
                  }}>
                  <TableCell>Keyingi to'lov:</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: hasDelay ? "error.main" : "text.primary",
                      fontWeight: hasDelay ? 600 : 400,
                    }}>
                    {contract.nextPaymentDate ?
                      new Date(contract.nextPaymentDate).toLocaleDateString(
                        "uz-UZ",
                      )
                    : "—"}
                  </TableCell>
                </TableRow>
                {(contract as any).manager && (
                  <TableRow>
                    <TableCell>Menejer:</TableCell>
                    <TableCell align="right">
                      {(contract as any).manager}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Stack>
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
