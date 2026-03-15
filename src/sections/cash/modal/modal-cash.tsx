import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";

import type { RootState } from "@/store";
import {
  Box,
  Chip,
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

import { formatNumber } from "@/utils/format-number";

import { closeModal } from "@/store/slices/modalSlice";
import { getCurrencyCourse } from "@/store/actions/dashboardActions";

interface IForm {
  currencyDetails: {
    dollar: number;
    sum: number;
  };
  notes: string;
  amount: number;
}

const defaultFormValues: IForm = {
  currencyDetails: { dollar: 0, sum: 0 },
  notes: "",
  amount: 0,
};

const ModalCash = () => {
  const dispatch = useAppDispatch();
  const { cashModal } = useSelector((state: RootState) => state.modal);
  const { currency } = useSelector((state: RootState) => state.dashboard);
  const cash = cashModal.data as any;

  const [formValues, setFormValues] = useState<IForm>(defaultFormValues);
  const [currencyCourse, setCurrencyCourse] = useState(0);

  const handleClose = useCallback(() => {
    setFormValues(defaultFormValues);
    dispatch(closeModal("cashModal"));
  }, [dispatch]);

  const calculateAmount = (dollar: number, sum: number, kurs: number) =>
    kurs > 0 ? Number((dollar + sum / kurs).toFixed(2)) : 0;

  const handleCurrencyChange = (key: "dollar" | "sum", value: string) => {
    const rawValue = value.replace(/\s/g, "");
    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setFormValues((prev) => {
      const updatedCurrency = {
        ...prev.currencyDetails,
        [key]: Number(rawValue),
      };
      const updatedAmount = calculateAmount(
        updatedCurrency.dollar,
        updatedCurrency.sum,
        currencyCourse,
      );

      return {
        ...prev,
        currencyDetails: updatedCurrency,
        amount: updatedAmount,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cash) return;

    console.warn("ModalCash: updateCash is deprecated and has been removed");

    handleClose();
  };

  useEffect(() => {
    dispatch(getCurrencyCourse());
    const init = async () => {
      if (!cashModal?.type) return;

      let kurs = cash?.currencyCourse;
      if (!kurs) {
        kurs = currency;
      }

      setCurrencyCourse(kurs || 0);

      if (cashModal.type === "edit" && cash) {
        const { dollar = 0, sum = 0 } = cash.currencyDetails || {};
        const amount = calculateAmount(dollar, sum, kurs || 1);

        setFormValues({
          currencyDetails: { dollar, sum },
          notes: cash.notes || "",
          amount,
        });
      } else {
        setFormValues(defaultFormValues);
      }
    };

    init();
  }, [cash, cashModal.type, currency, dispatch]);

  return (
    <Dialog
      open={!!cashModal?.type}
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
      maxWidth="md"
      fullWidth>
      <DialogTitle>
        {cashModal?.type === "edit" ?
          "To‘lovni Tahrirlash"
        : "Yangi To‘lov Qo‘shish"}
      </DialogTitle>

      <DialogContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexDirection="column"
          bgcolor="rgba(var(--palette-success-mainChannel) / 0.1)"
          borderRadius={0}
          p={1}>
          <Typography
            variant="h4"
            color="success.main"
            fontWeight={700}
            textAlign="center">
            <Box>
              <Typography
                component="span"
                fontWeight="bold"
                display="block"
                textAlign="center"
                fontSize={14}
                bgcolor="background.neutral"
                px={3}
                p={1}
                borderRadius={0}>
                {cash?.fullName}
              </Typography>
            </Box>
            {currencyCourse}
          </Typography>
        </Stack>

        <TextField
          label="Naqt ($)"
          fullWidth
          margin="dense"
          value={formatNumber(formValues.currencyDetails.dollar)}
          onChange={(e) => handleCurrencyChange("dollar", e.target.value)}
          InputProps={{ endAdornment: <Chip label="$" size="small" /> }}
        />

        <TextField
          label="Naqt (so‘m)"
          fullWidth
          margin="dense"
          value={formatNumber(formValues.currencyDetails.sum)}
          onChange={(e) => handleCurrencyChange("sum", e.target.value)}
          InputProps={{ endAdornment: <Chip label="$" size="small" /> }}
        />

        <TextField
          label="Izoh"
          fullWidth
          multiline
          margin="normal"
          rows={2}
          value={formValues.notes}
          onChange={(e) =>
            setFormValues((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
        />

        <Typography variant="subtitle2" mt={2}>
          Umumiy to‘lov miqdori ($)
        </Typography>
        <TextField
          required
          label="Umumiy to‘lov ($)"
          fullWidth
          margin="dense"
          value={formValues.amount}
          aria-readonly
          disabled
          InputProps={{ endAdornment: <Chip label="$" size="small" /> }}
        />
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleClose}>
          Bekor qilish
        </Button>
        <Button type="submit">Saqlash</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCash;
