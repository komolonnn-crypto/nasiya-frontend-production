import type { IContract } from "@/types/contract";
import React, { useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Stack,
  Button,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  IconButton,
  AccordionDetails,
  FormControlLabel,
  AccordionSummary,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { formatNumber } from "@/utils/format-number";
import { setModal } from "@/store/slices/modalSlice";
import { Iconify } from "@/components/iconify";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

// Global radius variable for consistency
const CUSTOM_RADIUS = "12px";

interface IReadOnlyTextFieldProps {
  value: string | number;
  label: string;
}

const ReadOnlyTextField = ({ value, label }: IReadOnlyTextFieldProps) => (
  <TextField
    value={value}
    margin="dense"
    label={label}
    fullWidth
    disabled
    InputProps={{
      sx: {
        borderRadius: CUSTOM_RADIUS, // Added border radius
        color: "text.primary",
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: "var(--palette-text-primary)",
        },
        "& fieldset": { borderRadius: CUSTOM_RADIUS }, // For the outline
      },
    }}
    InputLabelProps={{
      shrink: true,
      sx: {
        color: "text.secondary",
        "&.Mui-disabled": {
          color: "text.secondary",
        },
      },
    }}
  />
);

interface IProps {
  contract: IContract;
  showName?: boolean;
  readOnly?: boolean;
  onEditDate?: () => void;
}

const RenderContractFields: React.FC<IProps> = ({
  contract,
  showName = false,
  readOnly = false,
  onEditDate,
}) => {
  const dispatch = useAppDispatch();

  const { profile } = useSelector((state: RootState) => state.auth);
  const userRole = (
    typeof profile?.role === "string" ?
      profile.role
    : (profile?.role as any)?.name)?.toLowerCase();
  const canEditContract = userRole === "admin" || userRole === "moderator";

  const { paymentDeadline } = useMemo(() => {
    try {
      if (!contract.startDate) return { paymentDeadline: "" };
      const deadlineDate = new Date(contract.startDate);
      if (isNaN(deadlineDate.getTime())) return { paymentDeadline: "" };
      deadlineDate.setMonth(deadlineDate.getMonth() + (contract.period || 0));
      return { paymentDeadline: deadlineDate.toISOString().split("T")[0] };
    } catch (error) {
      return { paymentDeadline: "" };
    }
  }, [contract]);

  const dateFormat = (dateString: string) => dateString?.split("T")[0] || "";

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        mb={2}>
        <Typography variant="h6">Shartnoma ma&#39;lumotlari</Typography>
        {!readOnly && canEditContract && (
          <Stack direction="row" spacing={1}>
            {onEditDate && (
              <Button
                variant="contained"
                size="small"
                onClick={onEditDate}
                startIcon={<Iconify icon="solar:calendar-date-bold-duotone" width={18} />}
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  px: 1.5,
                  borderRadius: "10px", // Rounded Button
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    transform: "translateY(-1px)",
                  },
                }}>
                Sana
              </Button>
            )}

            <IconButton
              sx={{ borderRadius: "10px" }} // Rounded IconButton background
              onClick={() => {
                dispatch(setModal({ modal: "contractModal", data: { type: "edit", data: contract } }));
              }}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={2}>
        {showName && (
          <Grid xs={12}>
            <ReadOnlyTextField value={contract.productName} label="Mahsulot nomi" />
          </Grid>
        )}
        {/* ... (Other fields use ReadOnlyTextField which now has radius) ... */}
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.originalPrice ? formatNumber(contract.originalPrice) : "—"} label="Asl narxi" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.price ? formatNumber(contract.price) : "—"} label="Sotuv narxi" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.initialPayment ? formatNumber(contract.initialPayment) : "—"} label="Oldindan to'lov" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.initialPaymentDueDate ? dateFormat(contract.initialPaymentDueDate) : "—"} label="Oldindan to'lov sanasi" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.percentage ? formatNumber(contract.percentage) : "—"} label="Foiz" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.period ? formatNumber(contract.period) : "—"} label="Muddat (oy)" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.monthlyPayment ? formatNumber(contract.monthlyPayment) : "—"} label="Oylik to'lov" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.totalPrice ? formatNumber(contract.totalPrice) : "—"} label="Umumiy narx" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.totalPaid !== undefined ? formatNumber(contract.totalPaid) : "—"} label="To'langan summa" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.remainingDebt !== undefined ? formatNumber(contract.remainingDebt) : "—"} label="Qolgan summa" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={contract.startDate ? dateFormat(contract.startDate) : "—"} label="Shartnoma sanasi" /></Grid>
        <Grid xs={6} md={4}><ReadOnlyTextField value={paymentDeadline || "—"} label="To'lov muddati" /></Grid>

        <Grid xs={12}>
  <TextField
    value={contract.notes || ""}
    label="Izoh"
    fullWidth
    multiline
    rows={4} 
    margin="dense"
    disabled
    InputProps={{
      sx: {
        borderRadius: "12px", // Matches small component radius
        color: "text.primary",
        "& fieldset": { borderRadius: "12px" },
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: "var(--palette-text-primary)",
        },
        
        // Customizing the scrollbar to match the UI
        "& textarea": {
          overflowY: "auto !important", // Ensure scroll is allowed
          paddingRight: "8px", // Space for the scrollbar
          
          // 1. Scrollbar width
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          // 2. Scrollbar Track (Background)
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          // 3. Scrollbar Thumb (The moving part)
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => alpha(theme.palette.text.disabled, 0.3),
            borderRadius: "10px", // Rounded to match UI
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.text.disabled, 0.5),
            },
          },
        },
      },
    }}
    InputLabelProps={{ shrink: true }}
  />
</Grid>
        <Grid xs={12}>
          <Accordion
            sx={{
              mt: 2,
              bgcolor: "background.neutral",
              borderRadius: `${CUSTOM_RADIUS} !important`, // Rounded Accordion
              "&:before": { display: "none" }, // Remove default MUI line
              overflow: "hidden",
            }}>
            <AccordionSummary expandIcon={<FaChevronDown />}>
              <Typography variant="subtitle1">Qo&lsquo;shimcha ma&#39;lumotlar</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {['box', 'mbox', 'receipt', 'iCloud'].map((item) => (
                  <Grid xs={6} key={item}>
                    <FormControlLabel
                      control={<Checkbox checked={!!(contract.info as any)?.[item]} readOnly />}
                      label={item.charAt(0).toUpperCase() + item.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
};

export default RenderContractFields;