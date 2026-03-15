import type { RootState } from "@/store";
import type { IPayment } from "@/types/cash";

import { useCallback } from "react";
import { useSelector } from "react-redux";

import { Stack, IconButton, Tooltip, Button } from "@mui/material";
import { MdVisibility } from "react-icons/md";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { confirmPayments } from "@/store/actions/cashActions";
import { setModal } from "@/store/slices/modalSlice";

export default function ActionCash({ cash }: { cash: IPayment }) {
  const dispatch = useAppDispatch();
  const { profile } = useSelector((state: RootState) => state.auth);

  const isReminderNotification = cash.isReminderNotification || false;

  const canConfirmPayments = profile.role !== "seller" && profile.role !== null;
  const canRejectPayments = profile.role !== "seller" && profile.role !== null;

  const handleSelect = useCallback(() => {
    dispatch(
      setModal({
        modal: "cashInfoModal",
        data: { type: "info", data: cash },
      }),
    );
  }, [dispatch, cash]);

  const handleConfirm = useCallback(() => {
    if (!canConfirmPayments) {
      return;
    }
    dispatch(confirmPayments([cash._id]));
  }, [dispatch, cash._id, canConfirmPayments]);

  const handleReject = useCallback(() => {
    if (!canRejectPayments) {
      return;
    }
    dispatch(
      setModal({
        modal: "cashRejectModal",
        data: { type: "reject", data: cash },
      }),
    );
  }, [dispatch, cash, canRejectPayments]);

  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        minWidth: "200px",
        justifyContent: "flex-end",
        py: 0,
      }}>
      {}
      {canConfirmPayments && (
        <Button
          onClick={handleConfirm}
          size="small"
          variant="contained"
          color="success"
          sx={{
            minWidth: "70px",
            px: 1.2,
            py: 0.25,
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 1,
            height: "24px",
            "&:hover": {
              boxShadow: 2,
            },
          }}>
          Tasdiqlash
        </Button>
      )}

      {}
      {canRejectPayments && (
        <Button
          onClick={handleReject}
          size="small"
          variant="outlined"
          color="error"
          sx={{
            minWidth: "70px",
            px: 1.2,
            py: 0.25,
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "none",
            borderWidth: 1.5,
            height: "24px",
            "&:hover": {
              borderWidth: 1.5,
              bgcolor: "rgba(var(--palette-error-mainChannel) / 0.08)",
            },
          }}>
          Rad etish
        </Button>
      )}

      <Tooltip
        title={
          isReminderNotification ?
            "Eslatma ma'lumotlari (faqat ko'rish)"
          : "To'lov tafsilotlari"
        }
        arrow
        placement="left">
        <IconButton
          onClick={handleSelect}
          size="small"
          sx={{
            color: isReminderNotification ? "warning.main" : "info.main",
            bgcolor:
              isReminderNotification ?
                "rgba(var(--palette-warning-mainChannel) / 0.12)"
              : "rgba(var(--palette-info-mainChannel) / 0.12)",
            ml: 0.5,
            width: 24,
            height: 24,
            "&:hover": {
              bgcolor:
                isReminderNotification ?
                  "rgba(var(--palette-warning-mainChannel) / 0.2)"
                : "rgba(var(--palette-info-mainChannel) / 0.2)",
            },
            p: 0.5,
          }}>
          <MdVisibility size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
