import type { IContract } from "@/types/contract"

import React from "react";
import { IoChevronDownOutline } from "react-icons/io5";

import { useAppDispatch } from "@/hooks/useAppDispatch"
import { getCustomer } from "@/store/actions/customerActions"

import {
  Box,
  Chip,
  Paper,
  Stack,
  Divider,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import { PaymentSchedule } from "@/components/payment-schedule"

interface IProps {
  customerContracts?: IContract[];
  customerId?: string;
}

const CustomerContract: React.FC<IProps> = ({
  customerContracts,
  customerId,
}) => {
  const dispatch = useAppDispatch();

  const sortedContracts = [...(customerContracts ?? [])].sort((a, b) => {
    const order = { active: 0, cancelled: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Faol";
      case "completed":
        return "Yakunlangan";
      case "cancelled":
        return "Bekor qilingan";
      default:
        return status;
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="600">
        Xarid qilingan mahsulotlar
      </Typography>

      {sortedContracts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Hozircha xarid qilingan mahsulot yo'q
          </Typography>
        </Paper>
      ) : (
        sortedContracts.map((contract) => (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            }}
            key={contract._id}
          >
            <Accordion sx={{ boxShadow: "none" }}>
              <AccordionSummary
                expandIcon={<IoChevronDownOutline size={20} />}
                sx={{
                  bgcolor: "background.neutral",
                  "&:hover": { bgcolor: "action.hover" },
                  py: 1,
                  pl: 3.5,
                }}
              >
                <Stack
                  direction="row"
                  spacing={8}
                  alignItems="center"
                  width="94%"
                  flexWrap="wrap"
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                    {/* Day badge - NEW */}
                    <Chip
                      label={new Date(contract.startDate).getDate().toString().padStart(2, "0")}
                      size="small"
                      color="primary"
                      sx={{
                        height: 24,
                        minWidth: 32,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        borderRadius: "18px",
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight="700"
                    >
                      {contract.productName}
                    </Typography>
                  </Box>

                  <Chip
                    label={getStatusLabel(contract.status)}
                    color={getStatusColor(contract.status)}
                    size="small"
                    sx={{
                      width: 100,
                      height: 30,
                      borderRadius: "12px",
                    }}
                  />

                  <Box sx={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Boshlangan
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(contract.startDate).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Muddat
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.period ? `${contract.period} oy` : 'Belgilanmagan'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Oylik
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.monthlyPayment ? contract.monthlyPayment.toLocaleString() : '0'} $
                      </Typography>
                    </Box>

                    {/* Keyingi to'lov sanasi va kechiktirilgan sana */}
                    {contract.nextPaymentDate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Keyingi to'lov
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {new Date(
                            contract.nextPaymentDate
                          ).toLocaleDateString("uz-UZ")}
                        </Typography>
                        {contract.previousPaymentDate && (
                          <Typography
                            variant="caption"
                            color="warning.main"
                            display="block"
                          >
                            (Eski:{" "}
                            {new Date(
                              contract.previousPaymentDate
                            ).toLocaleDateString("uz-UZ")}
                            )
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {/* Shartnoma ma'lumotlari - Tartibli Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                      p: 1.5,
                      bgcolor: "background.neutral",
                      borderRadius: "12px",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Asl narxi
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.originalPrice ? contract.originalPrice.toLocaleString() : '0'} $
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Boshlang'ich to'lov
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.initialPayment ? contract.initialPayment.toLocaleString() : '0'} $
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Foiz
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.percentage}%
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Umumiy narx
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {contract.totalPrice ? contract.totalPrice.toLocaleString() : '0'} $
                      </Typography>
                    </Box>
                  </Box>

                  {/* To'lov holati - Alohida qator */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 2,
                      p: 1.5,
                      bgcolor: "background.neutral",
                      borderRadius: "12px",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        To'langan
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="success.main"
                      >
                        {contract.totalPaid?.toLocaleString() || 0} $
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={0.5}
                      >
                        Qolgan qarz
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="error.main"
                      >
                        {contract.remainingDebt?.toLocaleString() || 0} $
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {/* To'lov jadvali */}
                  <PaymentSchedule
                    startDate={contract.startDate}
                    monthlyPayment={contract.monthlyPayment}
                    period={contract.period}
                    initialPayment={contract.initialPayment}
                    initialPaymentDueDate={contract.initialPaymentDueDate}
                    contractId={contract._id}
                    remainingDebt={contract.remainingDebt}
                    totalPaid={contract.totalPaid}
                    totalPrice={contract.totalPrice}
                    payments={contract.payments}
                    onPaymentSuccess={() => {
                      // Mijozni qayta yuklash
                      if (customerId) {
                        dispatch(getCustomer(customerId));
                      }
                    }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))
      )}
    </Stack>
  );
};

export default CustomerContract;
