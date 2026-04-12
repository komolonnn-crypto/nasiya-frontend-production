import type { FC } from "react";
import type { IPayment } from "@/types/contract"

import { useState } from "react";

import {
  Table,
  Paper,
  colors,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  Chip,
} from "@mui/material";

import { Iconify } from "@/components/iconify";
import { tableEmptyUz } from "@/utils/table-empty-labels";
import PayCommentModal from "./pay-comment-modal";

interface IProps {
  payments: IPayment[];
}

const RenderPaymentHistory: FC<IProps> = ({ payments }) => {
  const [selectedComment, setSelectedComment] = useState("");

  if (payments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        To`lov mavjud emas
      </Typography>
    );
  }
  return (
    <>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sana</TableCell>
              <TableCell align="center">Oy</TableCell>
              <TableCell align="left">Summa</TableCell>
              <TableCell align="center">Izoh</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment, _idx) => (
              <TableRow
                key={payment._id}
                sx={{
                  bgcolor: payment.isPaid ? colors.green[100] : colors.red[100],
                }}
              >
                <TableCell>
                  {new Date(payment.date).toLocaleDateString("uz-UZ")}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      payment.paymentType === "initial" 
                        ? "0" 
                        : (payment as any).targetMonth 
                          ? `${(payment as any).targetMonth}` 
                          : tableEmptyUz.targetMonth
                    }
                    size="small"
                    variant="filled"
                    color={payment.paymentType === "initial" ? "secondary" : "primary"}
                    sx={{ minWidth: 50, fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell align="left">
                  {payment.amount.toLocaleString()}$
                </TableCell>
                <TableCell align="center">
                  {payment.notes && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedComment(payment.notes || "");
                      }}
                    >
                      <Iconify icon="eva:info-outline" width={20} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PayCommentModal
        open={selectedComment}
        onClose={() => setSelectedComment("")}
      />
    </>
  );
};

export default RenderPaymentHistory;
