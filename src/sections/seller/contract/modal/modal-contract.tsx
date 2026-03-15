import type { RootState } from "@/store";
import type { ICustomer } from "@/types/customer";
import type { IAddContract } from "@/types/contract";

import { useSelector } from "react-redux";
import { FaChevronDown } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { useMemo, useState, useEffect, useCallback } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  List,
  Chip,
  Stack,
  Button,
  Dialog,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  ListItem,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  DialogTitle,
  ListItemText,
  Autocomplete,
  DialogActions,
  DialogContent,
  useMediaQuery,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  createFilterOptions,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { formatNumber } from "@/utils/format-number";

import { setCustomer } from "@/store/slices/customerSlice";
import { setModal, closeModal } from "@/store/slices/modalSlice";
import {
  addContractSeller,
  updateSellerContract,
} from "@/store/actions/contractActions";
import { getSelectCustomers } from "@/store/actions/customerActions";

import { Iconify } from "@/components/iconify";

interface IPayment {
  date: string;
  amount: number;
  note: string;
}

interface IForm {
  customer?: string;
  productName: string;
  originalPrice: number;
  price: number;
  initialPayment: number;
  percentage: number;
  period: number;
  initialPaymentDueDate: string;
  monthlyPayment: number;
  notes: string;
  box: boolean;
  mbox: boolean;
  receipt: boolean;
  iCloud: boolean;
  totalPrice: number;
  remainingAmount: number;
  profitPrice: number;
  startDate: string;
  paymentDeadline?: string;
  payments?: IPayment[];
  currency: "USD" | "UZS";
}

const ModalContract = () => {
  const dispatch = useAppDispatch();
  const [isTouched, setIsTouched] = useState(true);
  const { contractModal } = useSelector((state: RootState) => state.modal);
  const { selectCustomers, selectCustomer, customer, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );
  const contract = contractModal || {};
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const now = useMemo(() => new Date(), []);

  const defaultEndDate = useMemo(() => {
    const date = new Date(now);
    date.setMonth(now.getMonth() + 12);
    return date;
  }, [now]);
  const defaultInitialDate = useMemo(() => {
    const date = new Date(now);
    date.setMonth(now.getMonth() + 1);
    return date;
  }, [now]);

  const defaultFormValues: IForm = {
    productName: "",
    originalPrice: 0,
    price: 0,
    initialPayment: 0,
    percentage: 30,
    period: 12,
    initialPaymentDueDate: defaultInitialDate.toISOString().split("T")[0]!,
    monthlyPayment: 0,
    notes: "",
    box: false,
    mbox: false,
    receipt: false,
    iCloud: false,
    totalPrice: 0,
    remainingAmount: 0,
    profitPrice: 0,
    startDate: now.toISOString().split("T")[0]!,
    paymentDeadline: defaultEndDate.toISOString().split("T")[0]!,
    payments: [],
    currency: "USD",
  };

  const [formValues, setFormValues] = useState<IForm>(defaultFormValues);

  useEffect(() => {
    if (contractModal?.type === "edit" && contractModal?.data) {
      const contractData = contractModal.data;

      if (typeof contractData.customer === "object" && contractData.customer) {
        dispatch(setCustomer(contractData.customer));
      }

      const customerId =
        typeof contractData.customer === "string" ?
          contractData.customer
        : contractData.customer?._id;

      setFormValues({
        ...(customerId && { customer: customerId }),
        productName: contractData.productName || "",
        originalPrice: contractData.originalPrice || 0,
        price: contractData.price || 0,
        initialPayment: contractData.initialPayment || 0,
        percentage: contractData.percentage || 30,
        period: contractData.period || 12,
        initialPaymentDueDate:
          contractData.initialPaymentDueDate?.split("T")[0]! ||
          defaultInitialDate.toISOString().split("T")[0]!,
        monthlyPayment: contractData.monthlyPayment || 0,
        notes: contractData.notes || "",
        box: contractData.info?.box || false,
        mbox: contractData.info?.mbox || false,
        receipt: contractData.info?.receipt || false,
        iCloud: contractData.info?.iCloud || false,
        totalPrice: contractData.totalPrice || 0,
        remainingAmount: contractData.remainingDebt || 0,
        profitPrice: 0,
        startDate:
          contractData.startDate?.split("T")[0]! ||
          now.toISOString().split("T")[0]!,
        paymentDeadline: defaultEndDate.toISOString().split("T")[0]!,
        currency: (contractData.currency as "USD" | "UZS") || "USD",
      });
      setIsTouched(false);
    }
  }, [contractModal, defaultInitialDate, defaultEndDate, now, dispatch]);

  const filterOptions = createFilterOptions<ICustomer>({
    limit: 3,
    stringify: (option: ICustomer) =>
      `${option.fullName} ${option.phoneNumber}`,
  });

  const { totalPrice, remainingAmount, profitPrice } = useMemo(() => {
    const total =
      formValues.initialPayment + formValues.monthlyPayment * formValues.period;

    const remaining = formValues.monthlyPayment * formValues.period;

    const profit = total - formValues.originalPrice;

    return {
      totalPrice: total,
      remainingAmount: remaining,
      profitPrice: profit,
    };
  }, [
    formValues.initialPayment,
    formValues.monthlyPayment,
    formValues.period,
    formValues.originalPrice,
  ]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = value === "" ? 0 : Number(value.replace(/\D/g, ""));

      setFormValues((prev) => ({ ...prev, [name]: numValue }));
    },
    [],
  );

  const handleClose = useCallback(() => {
    setFormValues(defaultFormValues);
    dispatch(closeModal("contractModal"));
    dispatch(setCustomer(null));
  }, [dispatch, defaultFormValues]);

  const handleMonthlyCalculate = useCallback(() => {
    const remainingPrice = formValues.price - formValues.initialPayment;
    const withInterest =
      remainingPrice + (remainingPrice * formValues.percentage) / 100;
    const monthly = withInterest / formValues.period;

    const calculatedMonthly = Number(monthly.toFixed(2));
    const calculatedTotal =
      formValues.initialPayment + calculatedMonthly * formValues.period;

    setFormValues((prev) => ({
      ...prev,
      monthlyPayment: calculatedMonthly,
      totalPrice: calculatedTotal,
    }));
  }, [
    formValues.price,
    formValues.percentage,
    formValues.initialPayment,
    formValues.period,
  ]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formJson = {
        ...formValues,
        id: contract.data?._id,
      };

      if (contractModal?.type === "edit" && contractModal?.data?._id) {
        dispatch(
          updateSellerContract({
            ...formJson,
            id: contractModal.data._id,
          } as any),
        );
      } else {
        dispatch(addContractSeller(formJson as unknown as IAddContract));
      }

      handleClose();
    },
    [formValues, contract, contractModal?.type, dispatch, handleClose],
  );

  const handleCustomerFocus = useCallback(() => {
    dispatch(getSelectCustomers());
  }, [selectCustomers.length, dispatch]);

  const isFormValid = useMemo(
    () =>
      formValues.productName.trim() !== "" &&
      formValues.originalPrice > 0 &&
      formValues.price > 0 &&
      formValues.initialPayment >= 0 &&
      formValues.percentage >= 0 &&
      formValues.period > 0 &&
      formValues.monthlyPayment > 0 &&
      formValues.profitPrice >= 0 &&
      formValues.initialPaymentDueDate !== "" &&
      formValues.notes.trim() !== "" &&
      formValues.price >= formValues.originalPrice &&
      !isTouched,
    [formValues, isTouched],
  );

  useEffect(() => {
    if (!formValues.initialPaymentDueDate) return;

    const baseDate = new Date(formValues.initialPaymentDueDate);
    baseDate.setMonth(baseDate.getMonth() + formValues.period);

    const deadline = baseDate.toISOString().split("T")[0]!;
    setFormValues((prev) => ({
      ...prev,
      paymentDeadline: deadline,
    }));
  }, [formValues.period, formValues.initialPaymentDueDate]);

  useEffect(() => {
    if (selectCustomer === null) return;
    dispatch(setCustomer(selectCustomer));
    setFormValues((prev) => {
      const customerId = selectCustomer?._id;
      return {
        ...prev,
        ...(customerId && { customer: customerId }),
      };
    });
  }, [selectCustomer]);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      totalPrice,
      remainingAmount,
      profitPrice,
    }));
  }, [totalPrice, remainingAmount, profitPrice]);

  useEffect(() => {
    const percentage = customer?.["percent"] || 30;
    setFormValues((prev) => ({
      ...prev,
      percentage,
    }));
  }, [customer]);

  return (
    <Dialog
      open={!!contractModal?.type}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
      maxWidth="xl"
      fullWidth
      fullScreen={fullScreen}>
      <DialogTitle>
        {contractModal?.type === "edit" ?
          "Shartnomani tahrirlash"
        : "Yangi Mahsulot Shartnomasi"}
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
        <Grid container spacing={1}>
          <Grid xs={12} my={2}>
            <Box
              display="flex"
              gap={3}
              flexDirection={{ xs: "column", sm: "row" }}>
              <Autocomplete
                onFocus={handleCustomerFocus}
                options={selectCustomers}
                getOptionLabel={(option) =>
                  `${option.fullName} ${option.phoneNumber}`
                }
                filterOptions={filterOptions}
                sx={{ width: { xs: "100%", sm: "100%" } }}
                loading={isLoading}
                loadingText="Yuklanmoqda..."
                noOptionsText="Mijozlar topilmadi"
                renderInput={(params) => {
                  const { size, InputLabelProps, ...restParams } = params;
                  const {
                    className: labelClassName,
                    style: labelStyle,
                    ...restLabelProps
                  } = InputLabelProps || {};

                  return (
                    <TextField
                      {...restParams}
                      {...(size && { size })}
                      label="Foydalanuvchini tanlang"
                      InputLabelProps={{
                        ...restLabelProps,
                        ...(labelClassName && { className: labelClassName }),
                        ...(labelStyle && { style: labelStyle }),
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading ?
                              <CircularProgress color="inherit" size={20} />
                            : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  );
                }}
                onChange={(_event, value) => {
                  dispatch(setCustomer(value));
                  setFormValues((prev) => {
                    const customerId = value?._id;
                    return {
                      ...prev,
                      ...(customerId && { customer: customerId }),
                    };
                  });
                }}
                value={customer}
              />
              {!customer && (
                <Tooltip title="Mijoz qo'shish">
                  <Button
                    variant="contained"
                    sx={{ width: { xs: "100%", sm: 300 } }}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => {
                      dispatch(
                        setModal({
                          modal: "customerModal",
                          data: { type: "add", data: undefined },
                        }),
                      );
                    }}>
                    Qo&apos;shish
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Grid>
          <Grid xs={12} lg={6}>
            {customer && (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{ width: 50, height: 50 }}
                      {...(customer?.fullName && { alt: customer.fullName })}
                    />
                    <Typography variant="h6" sx={{ cursor: "pointer" }}>
                      {customer?.fullName}
                    </Typography>
                    {customer?.isActive ?
                      <Tooltip title="Tasdiqlangan mijoz" placement="top">
                        <Typography>
                          <MdCheckCircle color="var(--palette-success-main)" />
                        </Typography>
                      </Tooltip>
                    : <Tooltip title="Hali tasdiqlanmagan" placement="top">
                        <Typography>
                          <MdCancel color="var(--palette-error-main)" />
                        </Typography>
                      </Tooltip>
                    }
                  </Stack>
                </Stack>
                <Divider sx={{ mt: 3 }} />
                <Box>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Passport seriyasi"
                        secondary={customer?.passportSeries || "___"}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Telefon raqami"
                        secondary={customer?.phoneNumber || "___"}
                      />
                    </ListItem>
                    <Divider component="li" />

                    <ListItem>
                      <ListItemText
                        primary="Tug'ilgan sana"
                        secondary={
                          customer?.birthDate ?
                            new Date(customer?.birthDate).toLocaleDateString()
                          : "___"
                        }
                      />
                    </ListItem>

                    {customer?.telegramName && (
                      <>
                        <Divider component="li" />
                        <ListItem>
                          <ListItemText
                            primary="Telegram"
                            secondary={`@${customer?.telegramName}`}
                          />
                        </ListItem>
                      </>
                    )}
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Mas'ul menejer"
                        secondary={
                          <Chip
                            avatar={<Avatar />}
                            label={customer?.manager?.fullName || "___"}
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </>
            )}
          </Grid>
          <Grid xs={12} lg={6}>
            <Box p={2}>
              {customer && (
                <Grid container spacing={1}>
                  <Grid xs={12} md={10}>
                    <TextField
                      value={formValues.productName}
                      onChange={handleChange}
                      autoFocus
                      required
                      margin="dense"
                      id="productName"
                      name="productName"
                      label="Mahsulot nomi"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} md={2}>
                    <Box sx={{ mt: 1, mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5, display: "block" }}>
                        Pul birligi
                      </Typography>
                      <ToggleButtonGroup
                        value={formValues.currency}
                        exclusive
                        onChange={(_e, val) => {
                          if (val)
                            setFormValues((prev) => ({
                              ...prev,
                              currency: val,
                            }));
                        }}
                        size="small"
                        fullWidth>
                        <ToggleButton
                          value="USD"
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                          $ USD
                        </ToggleButton>
                        <ToggleButton
                          value="UZS"
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                          UZS
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Grid>
                  <Grid xs={6} md={4}>
                    <TextField
                      value={formatNumber(formValues.originalPrice)}
                      onChange={handleNumberChange}
                      required
                      margin="dense"
                      id="originalPrice"
                      name="originalPrice"
                      label="Asl narxi"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={6} md={4}>
                    <TextField
                      value={formatNumber(formValues.price)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleNumberChange(e);
                        setIsTouched(true);
                      }}
                      required
                      margin="dense"
                      id="price"
                      name="price"
                      label="Sotuv narxi"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={6} md={4}>
                    <TextField
                      value={formatNumber(formValues.initialPayment)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleNumberChange(e);
                        setIsTouched(true);
                      }}
                      required
                      margin="dense"
                      id="initialPayment"
                      name="initialPayment"
                      label={`Oldindan to'lov`}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={6} md={4}>
                    <TextField
                      value={formatNumber(formValues.percentage)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleNumberChange(e);
                        setIsTouched(true);
                      }}
                      onBlur={() => {
                        if (
                          !formValues.percentage ||
                          formValues.percentage <= 0
                        ) {
                          setFormValues((prev) => ({ ...prev, percentage: 1 }));
                        }
                      }}
                      required
                      margin="dense"
                      id="percentage"
                      name="percentage"
                      label="Foiz"
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={6} md={4}>
                    <TextField
                      value={formatNumber(formValues.period)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleNumberChange(e);
                        setIsTouched(true);
                      }}
                      onBlur={() => {
                        if (!formValues.period || formValues.period <= 0) {
                          setFormValues((prev) => ({ ...prev, period: 1 }));
                        }
                      }}
                      required
                      margin="dense"
                      id="period"
                      name="period"
                      label="Muddat (oy)"
                      fullWidth
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <TextField
                      value={formValues.initialPaymentDueDate}
                      onChange={handleChange}
                      margin="dense"
                      id="initialPaymentDueDate"
                      name="initialPaymentDueDate"
                      label="Birinchi to'lov sanasi"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  <Grid xs={12}>
                    <Box>
                      <Grid container spacing={1}>
                        <Grid
                          xs={6}
                          sx={{ display: "flex", alignItems: "center" }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              handleMonthlyCalculate();
                              setIsTouched(false);
                            }}
                            fullWidth
                            size="large">
                            Oylik to&apos;lov
                          </Button>
                        </Grid>

                        <Grid xs={6}>
                          <TextField
                            value={formatNumber(formValues.monthlyPayment)}
                            onChange={handleNumberChange}
                            onBlur={() => {
                              if (formValues.monthlyPayment === 0) {
                                setIsTouched(true);
                              }
                            }}
                            required
                            margin="dense"
                            id="monthlyPayment"
                            name="monthlyPayment"
                            label={`Oylik to'lov`}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid xs={12}>
                    <TextField
                      value={formValues.notes}
                      onChange={handleChange}
                      margin="dense"
                      id="notes"
                      name="notes"
                      label="Izoh"
                      fullWidth
                      required
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid xs={12}>
                    <Accordion
                      sx={{
                        mt: 2,
                        bgcolor: "background.neutral",
                        borderRadius: 0,
                      }}>
                      <AccordionSummary expandIcon={<FaChevronDown />}>
                        <Typography variant="subtitle1">
                          Qo&lsquo;shimcha ma&#39;lumotlar
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid xs={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formValues.box}
                                  onChange={handleChange}
                                  name="box"
                                />
                              }
                              label="Karobka"
                            />
                          </Grid>
                          <Grid xs={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formValues.mbox}
                                  onChange={handleChange}
                                  name="mbox"
                                />
                              }
                              label="Muslim karobka"
                            />
                          </Grid>
                          <Grid xs={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formValues.receipt}
                                  onChange={handleChange}
                                  name="receipt"
                                />
                              }
                              label="Tilxat"
                            />
                          </Grid>
                          <Grid xs={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formValues.iCloud}
                                  onChange={handleChange}
                                  name="icloud"
                                />
                              }
                              label="iCloud"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  <Grid xs={4}>
                    <TextField
                      value={formatNumber(formValues.totalPrice)}
                      margin="dense"
                      id="totalPrice"
                      name="totalPrice"
                      label="Umumiy summa"
                      fullWidth
                      aria-readonly
                      disabled
                    />
                  </Grid>
                  <Grid xs={4}>
                    <TextField
                      value={formatNumber(formValues.remainingAmount)}
                      required
                      margin="dense"
                      id="remainingAmount"
                      name="remainingAmount"
                      label="Qolgan summa"
                      fullWidth
                      aria-readonly
                      disabled
                    />
                  </Grid>
                  <Grid xs={4}>
                    <TextField
                      value={formatNumber(formValues.profitPrice)}
                      required
                      margin="dense"
                      id="profitPrice"
                      name="profitPrice"
                      label="Foyda"
                      fullWidth
                      aria-readonly
                      disabled
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      value={formValues.startDate}
                      onChange={handleChange}
                      required
                      margin="dense"
                      id="startDate"
                      name="startDate"
                      label="Shartnoma sanasi"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      aria-readonly
                      {...(!(
                        formValues.payments && formValues.payments.length > 0
                      ) && { disabled: true })}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      value={formValues.paymentDeadline}
                      required
                      margin="dense"
                      id="paymentDeadline"
                      name="paymentDeadline"
                      label="To'lov muddati"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      aria-readonly
                      disabled
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleClose}>
          Bekor qilish
        </Button>
        <Button type="submit" {...(!isFormValid && { disabled: true })}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalContract;
