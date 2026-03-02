import type { FC } from "react";

import { useState, useEffect, useRef } from "react";

import {
  Box,
  Alert,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import authApi from "@/server/auth"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { enqueueSnackbar } from "@/store/slices/snackbar"

interface PaymentModalProps {
  open: boolean;
  amount: number;
  contractId: string;
  isPayAll?: boolean;
  paymentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: FC<PaymentModalProps> = ({
  open,
  amount,
  contractId,
  isPayAll = false,
  paymentId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const dollarInputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [dollarAmount, setDollarAmount] = useState(amount);
  const [sumAmount, setSumAmount] = useState(0);
  const [currencyCourse, setCurrencyCourse] = useState(0);
  // const [paymentMethod, setPaymentMethod] = useState<string>("dollar_cash");
  // console.log(paymentMethod);
  //  // ✅ YANGI: To'lov usuli
  //  const [checkIfMethodSet, setCheckIfMethodSet] = useState(false);
  // //  Tasdiqlashdan oldin to'lov usuli to'g'ri tanlanganini tekshirish

  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const totalAmountInDollar = dollarAmount + sumAmount / currencyCourse;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrencyCourse = async () => {
      try {
        const res = await authApi.get("/dashboard/currency-course");
        if (res.data && res.data.course) {
          const course = res.data.course;
          setCurrencyCourse(course);

          setDollarAmount(0);
          setSumAmount(0);
          setDollarInput("");
          setSumInput("");

          setTimeout(() => {
            if (dollarInputRef.current) {
              dollarInputRef.current.focus();
              dollarInputRef.current.select();
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error fetching currency course:", error);
        const course = 12500;

        setCurrencyCourse(course);
        setDollarAmount(0);
        setSumAmount(0); // So'm input bo'sh boshlanadi
        setDollarInput(""); // Bo'sh boshlanadi
        setSumInput(""); // So'm input bo'sh

        setTimeout(() => {
          if (dollarInputRef.current) {
            dollarInputRef.current.focus();
            dollarInputRef.current.select();
          }
        }, 100);
      }
    };

    if (open) {
      fetchCurrencyCourse();
    }
  }, [open, amount]);

  const [dollarInput, setDollarInput] = useState(""); // Bo'sh boshlanadi
  const [sumInput, setSumInput] = useState(""); // So'm input bo'sh boshlanadi

  // const formatNumber = (num: number): string => {
  //   return new Intl.NumberFormat("en-US", {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 2,
  //   }).format(num);
  // };

  const parseInputNumber = (str: string): number => {
    const cleaned = str.replace(/[^\d.,]/g, "");
    const normalized = cleaned.replace(/,/g, "");
    return parseFloat(normalized) || 0;
  };

  const handleDollarChange = (value: string) => {
    if (value === "" || /^[\d.]*$/.test(value)) {
      setDollarInput(value);
      const numValue = parseInputNumber(value);
      setDollarAmount(numValue);
    }
  };

  const handleSumChange = (value: string) => {
    if (value === "" || /^[\d.]*$/.test(value)) {
      setSumInput(value);
      const numValue = parseInputNumber(value);
      setSumAmount(numValue);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (!contractId) {
        setError("Contract ID topilmadi");
        setLoading(false);
        return;
      }

      if (totalAmountInDollar <= 0) {
        setError("To'lov summasi noto'g'ri");
        setLoading(false);
        return;
      }

      if (!currencyCourse || currencyCourse <= 0) {
        setError("Valyuta kursi yuklanmadi. Iltimos, qayta urinib ko'ring.");
        setLoading(false);
        return;
      }

      // if (!checkIfMethodSet) {
      //   setError("To'lov usuli tanlanmadi. Iltimos, qayta urinib ko'ring."); // ✅ YANGI: To'lov usuli
      //   setLoading(false);
      //   return;
      // }

      if (!paymentMethod) {
        setError("To'lov usulini tanlang.");
        setLoading(false);
        return;
      }

      const paymentData = {
        contractId,
        amount: totalAmountInDollar, // Jami summa dolarda
        notes: note || "",
        currencyDetails: {
          dollar: dollarAmount,
          sum: sumAmount,
        },
        currencyCourse,
        paymentMethod: paymentMethod, // ✅ YANGI: To'lov usuli
      };

      let endpoint = "/payment/contract";
      let requestData: any = paymentData;

      if (isPayAll) {
        endpoint = "/payment/pay-all-remaining";
      } else if (paymentId) {
        endpoint = "/payment/pay-remaining";
        requestData = {
          paymentId: paymentId,
          amount: totalAmountInDollar, // Jami summa dolarda
          notes: note || "",
          currencyDetails: {
            dollar: dollarAmount,
            sum: sumAmount,
          },
          currencyCourse,
          paymentMethod: paymentMethod, // ✅ YANGI: To'lov usuli
        };
      }

      const res = await authApi.post(endpoint, requestData);

      let notificationMessage =
        res.data.message || "To'lov muvaffaqiyatli amalga oshirildi";
      let notificationVariant: "success" | "warning" | "info" = "success";

      if (isPayAll) {
        if (res.data.underpaidCount > 0) {
          notificationVariant = "warning";
          notificationMessage =
            res.data.message ||
            `${res.data.paymentsCreated} oylik to'lovlar yaratildi.\n⚠️ ${res.data.underpaidCount} oyda kam to'landi (${res.data.totalShortage.toFixed(2)} $)`;
        } else {
          notificationMessage =
            res.data.message ||
            `${res.data.paymentsCreated} oylik to'lovlar muvaffaqiyatli amalga oshirildi`;
        }
      } else if (paymentId) {
        // payRemaining response
        const payment = res.data.payment;
        if (payment) {
          if (payment.status === "PAID" && payment.isPaid) {
            notificationVariant = "success";
            notificationMessage = "✅ Qolgan qarz to'liq to'landi!";
          } else if (payment.remainingAmount > 0) {
            notificationVariant = "warning";
            notificationMessage = `⚠️ Qolgan qarz qisman to'landi.\nHali ${payment.remainingAmount.toFixed(2)} $ qoldi`;
          }
        }
      }
      // Oddiy to'lov uchun
      else {
        const paymentDetails = res.data.paymentDetails;
        if (paymentDetails) {
          if (paymentDetails.status === "UNDERPAID") {
            notificationVariant = "warning";
            notificationMessage = `⚠️ ${notificationMessage}\nQolgan qarz: ${paymentDetails.remainingAmount.toFixed(2)} $`;
          } else if (paymentDetails.status === "OVERPAID") {
            notificationVariant = "info";
            notificationMessage = `✅ ${notificationMessage}\nOrtiqcha summa: ${paymentDetails.excessAmount.toFixed(2)} $ (keyingi oyga o'tkazildi)`;
          }
        }
      }

      dispatch(
        enqueueSnackbar({
          message: notificationMessage,
          options: { variant: notificationVariant },
        }),
      );

      // Modal'ni yopish va ma'lumotlarni tozalash
      setNote("");
      setDollarInput(""); // Dollar inputni tozalash
      setSumInput(""); // So'm inputni tozalash
      setDollarAmount(0);
      setSumAmount(0);
      onClose();

      // Backend'da ma'lumotlar yangilanishi uchun biroz kutamiz
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "To'lov amalga oshirilmadi";

      setError(errorMessage);

      dispatch(
        enqueueSnackbar({
          message: errorMessage,
          options: { variant: "error" },
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  // Real-time hisoblash (jami summa bilan)
  const difference = totalAmountInDollar - amount;
  const isUnderpaid = difference < -0.01;
  const isOverpaid = difference > 0.01;
  const isExact = Math.abs(difference) <= 0.01;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth   PaperProps={{
    sx: {
      borderRadius: "20px", // Matches your modern UI style
      padding: "8px",       // Optional: adds some internal spacing
    },
  }}>
      <DialogTitle>
        {isPayAll ? "Barcha oylarni to'lash" : "To'lovni tasdiqlash"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Oylik to'lov ma'lumoti */}
          <Box
            sx={{
              p: 2,
              bgcolor: isPayAll ? "rgba(var(--palette-success-mainChannel) / 0.1)" : "background.neutral",
              borderRadius: "12px",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {isPayAll ? "Qolgan qarz:" : "Oylik to'lov:"}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {amount.toLocaleString()} $
            </Typography>
            {isPayAll && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                Barcha to'lanmagan oylar uchun
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Dollar"
            value={dollarInput}
            onChange={(e) => handleDollarChange(e.target.value)}
            placeholder="0.00"
            inputRef={dollarInputRef}
            InputProps={{
              endAdornment: <InputAdornment position="end">$</InputAdornment>,
            }}
          />

          <TextField
            fullWidth
            label="So'm"
            value={sumInput}
            onChange={(e) => handleSumChange(e.target.value)}
            placeholder="0"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">so'm</InputAdornment>
              ),
            }}
          />

          {/* ✅ YANGI: To'lov usuli tanlash */}

          <FormControl fullWidth>
            <InputLabel id="payment-method-label">To'lov usuli</InputLabel>

            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="To'lov usuli"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="">
                <em>Tanlang</em>
              </MenuItem>
              <MenuItem value="som_cash">So'm naqd</MenuItem>
              <MenuItem value="som_card">So'm karta</MenuItem>
              <MenuItem value="dollar_cash">Dollar naqd</MenuItem>
              <MenuItem value="dollar_card_visa">Dollar karta (Visa)</MenuItem>
            </Select>
          </FormControl>
          {/* <FormControl fullWidth>
            <InputLabel id="payment-method-label">To'lov usuli</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method-select"
              value={paymentMethod}
              label="To'lov usuli"
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setCheckIfMethodSet(true);
              }}
            >
              <MenuItem value="som_cash">So'm naqd</MenuItem>
              <MenuItem value="som_card">So'm karta</MenuItem>
              <MenuItem value="dollar_cash">Dollar naqd</MenuItem>
              <MenuItem value="dollar_card_visa">Dollar karta (Visa)</MenuItem>
            </Select>
          </FormControl> */}

          <Box
            sx={{
              p: 2,
              bgcolor: "background.neutral",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Kurs: 1$ = {currencyCourse.toLocaleString()} so'm
            </Typography>
            {sumAmount > 0 && (
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight="bold"
              >
                Jami: {dollarAmount.toFixed(2)} $ + {sumAmount.toFixed(0)} so'm
                = {totalAmountInDollar.toFixed(2)} $
              </Typography>
            )}
          </Box>

          {/* Real-time hisoblash natijasi - faqat oddiy to'lov uchun */}
          {!isPayAll && totalAmountInDollar > 0 && (
            <Box>
              {/* Kam to'langan */}
              {isUnderpaid && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Kam to'layapsiz
                  </Typography>
                  <Typography variant="body2">
                    Yana <strong>{Math.abs(difference).toFixed(2)} $</strong>{" "}
                    to'lashingiz kerak
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    To'layotgan: {totalAmountInDollar.toFixed(2)} $ | Kerak:{" "}
                    {amount.toFixed(2)} $
                  </Typography>
                </Alert>
              )}

              {/* Ko'p to'langan */}
              {isOverpaid && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Ko'p to'layapsiz
                  </Typography>
                  <Typography variant="body2">
                    <strong>{difference.toFixed(2)} $</strong> ortiqcha
                    to'layapsiz
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bu summa keyingi oyga o'tkaziladi
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    To'layotgan: {totalAmountInDollar.toFixed(2)} $ | Kerak:{" "}
                    {amount.toFixed(2)} $
                  </Typography>
                </Alert>
              )}

              {/* To'g'ri to'langan */}
              {isExact && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ✓ To'g'ri summa
                  </Typography>
                  <Typography variant="body2">
                    Oylik to'lovga to'liq mos keladi
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    To'layotgan: {totalAmountInDollar.toFixed(2)} $ = Kerak:{" "}
                    {amount.toFixed(2)} $
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Izoh (ixtiyoriy)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="To'lov haqida qo'shimcha ma'lumot... (majburiy emas)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || totalAmountInDollar <= 0}
        >
          {loading ? "Yuklanmoqda..." : "Tasdiqlash"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
