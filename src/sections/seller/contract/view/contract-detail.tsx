import type { RootState } from "@/store";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Grid from "@mui/material/Unstable_Grid2";
import { Box, Paper, Button } from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { DashboardContent } from "@/layouts/dashboard";
import { setContractId } from "@/store/slices/contractSlice";
import { getSellerContract } from "@/store/actions/contractActions";

import { Iconify } from "@/components/iconify";
import Loader from "@/components/loader/Loader";
import CustomerInfo from "@/components/customer-infos/customerInfo";
import { PaymentSchedule } from "@/components/payment-schedule";
import PayCommentModal from "@/components/render-payment-history/pay-comment-modal";
import RenderContractFields from "@/components/render-contract-fields/renderContractFields";

const ContractDetails = () => {
  const dispatch = useAppDispatch();
  const [selectedComment, setSelectedComment] = useState("");
  const { contract, isLoading, contractId } = useSelector(
    (state: RootState) => state.contract,
  );
  const { customer } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    if (contractId) {
      dispatch(getSellerContract(contractId));
    }
  }, [contractId, dispatch]);

  if (!contract && isLoading) {
    return <Loader />;
  }

  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        mb={5}
        justifyContent="space-between">
        <Button
          color="inherit"
          startIcon={<Iconify icon="weui:back-filled" />}
          onClick={() => dispatch(setContractId(null))}>
          Ortga
        </Button>
      </Box>

      <Grid container spacing={3} my={2}>
        {}
        <Grid xs={12} display="flex" flexDirection="column" gap={3}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            {contract?.customer && <CustomerInfo customer={customer} top />}
          </Paper>
        </Grid>

        {}
        <Grid xs={12} md={4}>
          {}
          {contract && (
            <Paper
              elevation={3}
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Grid container spacing={1}>
                <RenderContractFields contract={contract} showName />
              </Grid>
            </Paper>
          )}
        </Grid>

        <Grid xs={12} md={8}>
          {}
          {contract && (
            <PaymentSchedule
              startDate={contract.startDate}
              monthlyPayment={contract.monthlyPayment}
              period={contract.period}
              initialPayment={contract.initialPayment}
              initialPaymentDueDate={contract.initialPaymentDueDate}
              contractId={contract._id}
              remainingDebt={contract.remainingDebt}
              totalPaid={contract.totalPaid}
              payments={contract.payments}
              onPaymentSuccess={() => {
                dispatch(getSellerContract(contract._id));
              }}
            />
          )}
        </Grid>
      </Grid>
      <PayCommentModal
        open={selectedComment}
        onClose={() => setSelectedComment("")}
      />
    </DashboardContent>
  );
};

export default ContractDetails;
