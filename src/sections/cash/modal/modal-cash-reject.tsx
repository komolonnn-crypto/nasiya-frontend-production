import type { RootState } from "@/store";
import type { IPayment } from "@/types/cash";

import { useSelector } from "react-redux";
import { useState, useCallback } from "react";

import {
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { closeModal } from "@/store/slices/modalSlice";
import { rejectPayment } from "@/store/actions/cashActions";

const ModalCashReject = () => {
  const dispatch = useAppDispatch();

  const { cashRejectModal } = useSelector((state: RootState) => state.modal);

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const payment = cashRejectModal?.data as IPayment | undefined;

  const handleClose = useCallback(() => {
    dispatch(closeModal("cashRejectModal"));
    setReason("");
    setError("");
  }, [dispatch]);

  const handleReject = useCallback(() => {
    if (!reason.trim()) {
      setError("Rad etish sababi kiritilishi shart");
      return;
    }

    if (!payment?._id) {
      setError("To'lov ID topilmadi");
      return;
    }

    dispatch(rejectPayment(payment._id, reason.trim()));

    handleClose();
  }, [dispatch, payment, reason, handleClose]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReason(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <Dialog
      open={!!cashRejectModal?.type}
      maxWidth="sm"
      fullWidth
      onClose={handleClose}>
      <DialogTitle>To'lovni Rad Etish</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            To'lovni rad etish sababini kiriting. Bu sabab menejerga
            ko'rsatiladi.
          </Typography>

          {payment && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Mijoz:</strong>{" "}
                {typeof payment.customerId === "object" ?
                  `${payment.customerId.firstName || ""} ${payment.customerId.lastName || ""}`.trim() ||
                  "___"
                : "___"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Summa:</strong> ${payment.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Sana:</strong>{" "}
                {new Date(payment.date).toLocaleDateString()}
              </Typography>
            </Stack>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rad etish sababi"
            placeholder="Masalan: To'lov summasi noto'g'ri, Mijoz ma'lumotlari mos kelmayapti, va h.k."
            value={reason}
            onChange={handleReasonChange}
            error={!!error}
            helperText={error}
            required
            autoFocus
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Bekor qilish
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleReject}
          disabled={!reason.trim()}>
          Rad Etish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCashReject;
