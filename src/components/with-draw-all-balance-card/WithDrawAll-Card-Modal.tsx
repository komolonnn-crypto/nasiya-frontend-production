import type { FC } from "react";
import type { IEmployee } from "@/types/employee";
import type { CurrencyDetails } from "@/types/cash";
import type { RootState } from "@/store";

import { useState } from "react";
import { useSelector } from "react-redux";

import {
  Grid,
  Stack,
  Button,
  Divider,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
  Box,
  Card,
  CardContent,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { formatNumber } from "@/utils/format-number";
import { enqueueSnackbar } from "@/store/slices/snackbar";
import { withdrawFromBalance } from "@/store/actions/employeeActions";
import { varAlpha } from "@/theme/styles";

type CurrencyKey = "sum" | "dollar";

const balanceFields: readonly {
  key: CurrencyKey;
  label: string;
  currency: "so'm" | "$";
}[] = [
  { key: "dollar", label: "Dollar", currency: "$" },
  { key: "sum", label: "So'm", currency: "so'm" },
];

interface Props {
  employee: IEmployee;
}

const WithdrawAllBalanceCard: FC<Props> = ({ employee }) => {
  const dispatch = useAppDispatch();
  const { currency: exchangeRate } = useSelector(
    (state: RootState) => state.dashboard
  );

  // We allow string or number to make the TextField behavior smooth
  const [amounts, setAmounts] = useState<Record<CurrencyKey, string | number>>({
    dollar: "",
    sum: "",
  });
  const [showControls, setShowControls] = useState(false);
  const [notes, setNotes] = useState("");

  const calculateTotalInDollars = () => {
    const dollarAmount = Number(amounts.dollar) || 0;
    const sumAmount = Number(amounts.sum) || 0;
    const sumInDollars = exchangeRate > 0 ? sumAmount / exchangeRate : 0;
    return dollarAmount + sumInDollars;
  };

  const handleChange = (key: CurrencyKey, value: string) => {
    // 1. Allow clearing the input
    if (value === "") {
      setAmounts((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    const numValue = Number(value);
    const max = employee.balance[key] ?? 0;

    // 2. Prevent negative numbers
    if (numValue < 0) return;

    // 3. Validation for max balance
    if (numValue > max) {
      dispatch(
        enqueueSnackbar({
          message: `${balanceFields.find((f) => f.key === key)?.label} uchun ${formatNumber(max)} dan oshirib bo'lmaydi`,
          options: { variant: "warning" },
        })
      );
      setAmounts((prev) => ({ ...prev, [key]: max }));
    } else {
      setAmounts((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleFullWithdraw = (key: CurrencyKey) => {
    setAmounts((prev) => ({ 
        ...prev, 
        [key]: employee.balance[key] || 0,
        // Clear the other field to respect the mutual exclusivity
        [key === "dollar" ? "sum" : "dollar"]: ""
    }));
  };

  const handleSubmit = () => {
    const normalizedAmounts: CurrencyDetails = {
      sum: Number(amounts.sum) || 0,
      dollar: Number(amounts.dollar) || 0,
    };

    const total = normalizedAmounts.sum + normalizedAmounts.dollar;

    if (total <= 0) {
      dispatch(enqueueSnackbar({ message: "Summa 0 bo'lishi mumkin emas", options: { variant: "error" } }));
      return;
    }

    dispatch(withdrawFromBalance(employee._id, normalizedAmounts, notes));
    setAmounts({ dollar: "", sum: "" });
    setNotes("");
    setShowControls(false); 
  };

  return (
    <Box sx={{ 
      p: 3, 
      borderRadius: "18px", 
      bgcolor: 'background.neutral',
      border: (theme) => `1px solid ${theme.palette.divider}` 
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Umumiy yechib olish</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={showControls}
              onChange={(e) => {
                setShowControls(e.target.checked);
                if (!e.target.checked) {
                  setAmounts({ dollar: "", sum: "" });
                  setNotes("");
                }
              }}
            />
          }
          label="Yechish rejimini yoqish"
        />
      </Stack>

      <Stack spacing={2}>
        {balanceFields.map(({ key, label }) => {
          const otherKey = key === "dollar" ? "sum" : "dollar";
          // Disable if the OTHER field has any value > 0
          const isOtherFieldActive = Number(amounts[otherKey]) > 0;

          return (
            <Grid container spacing={2} key={key} alignItems="center">
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {label}: <Typography component="span" variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {formatNumber(employee.balance[key] ?? 0)}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  size="small"
                  type="number"
                  value={amounts[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  fullWidth
                  placeholder="0.00"
                  disabled={!showControls || isOtherFieldActive}
                  // Prevents mouse wheel from changing values accidentally
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={3}>
                {showControls && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleFullWithdraw(key)}
                    disabled={isOtherFieldActive}
                    sx={{ borderRadius: '12px', height: '40px' }}
                  >
                    To'liq
                  </Button>
                )}
              </Grid>
            </Grid>
          );
        })}
      </Stack>

      {showControls && (
        <>
          <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

          <Card
            sx={{
              mb: 3,
              borderRadius: '16px',
              bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
              border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.2)}`,
              boxShadow: 'none'
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, mb: 1 }}>
                Umumiy yechilayotgan summa
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Dollar: {formatNumber(Number(amounts.dollar) || 0)} $
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  So'm: {formatNumber(Number(amounts.sum) || 0)} so'm
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.12), borderRadius: '12px', textAlign: 'center' }}>
                <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 900 }}>
                  Jami: {formatNumber(calculateTotalInDollars())} $
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Kurs: 1$ = {formatNumber(exchangeRate)} so'm
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Izoh (ixtiyoriy)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleSubmit}
            sx={{ borderRadius: "12px", py: 1.5, fontWeight: 800 }}
          >
            Tasdiqlash ({formatNumber(calculateTotalInDollars())} $ jami)
          </Button>
        </>
      )}
    </Box>
  );
};

export default WithdrawAllBalanceCard;