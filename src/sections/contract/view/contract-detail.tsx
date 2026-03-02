import { useState, useEffect } from "react";

import type { RootState } from "@/store"
import { useSelector } from "react-redux";

import Grid from "@mui/material/Unstable_Grid2";
import { Box, Paper, Button } from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch"
import { DashboardContent } from "@/layouts/dashboard"
import { setContractId } from "@/store/slices/contractSlice"
import { getContract } from "@/store/actions/contractActions"

import { Iconify } from "@/components/iconify"
import Loader from "@/components/loader/Loader"
import CustomerInfo from "@/components/customer-infos/customerInfo"
import { PaymentSchedule } from "@/components/payment-schedule"
import PayCommentModal from "@/components/render-payment-history/pay-comment-modal"
import { EditHistory } from "@/components/edit-history"
import ContractDateEditModal from "@/components/contract-date-edit-modal/ContractDateEditModal"

import Calculate from "./calculate";

const ContractDetails = () => {
  const dispatch = useAppDispatch();
  const [selectedComment, setSelectedComment] = useState("");
  const [dateEditModalOpen, setDateEditModalOpen] = useState(false);
  const { contract, isLoading, contractId } = useSelector(
    (state: RootState) => state.contract
  );
  const { customer } = useSelector((state: RootState) => state.customer);
  const { profile } = useSelector((state: RootState) => state.auth);
  
  // Check if user is admin or moderator
  const userRole = (typeof profile?.role === 'string' ? profile.role : (profile?.role as any)?.name)?.toLowerCase();
  const isAdminOrModerator = userRole === "admin" || userRole === "moderator";

  useEffect(() => {
    if (contractId) {
      dispatch(getContract(contractId));
    }
  }, [contractId, dispatch]);

  const contractCustomer = contract?.customer || customer;

  if (!contract && isLoading) {
    return <Loader />;
  }
  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        mb={5}
        justifyContent="space-between"
      >
        <Button
          color="inherit"
          startIcon={<Iconify icon="weui:back-filled" />}
          onClick={() => dispatch(setContractId(null))}
        >
          Ortga
        </Button>
      </Box>

      <Grid container spacing={3} my={2}>
        {/* Mijoz ma'lumotlari */}
        <Grid xs={12}>
          <Paper elevation={3} sx={{ p: 2 ,borderRadius: "18px"}}>
            {contract?.customer && (
              <CustomerInfo customer={contractCustomer} top />
            )}
          </Paper>
        </Grid>

        {/* Shartnoma ma'lumotlari va To'lov jadvali - YONMA-YON */}
        <Grid xs={12} md={4}>
          {/* Shartnoma ma'lumotlari */}
          {contract && (
            <Calculate 
              contract={contract} 
              onEditDate={() => setDateEditModalOpen(true)}
            />
          )}
        </Grid>

        <Grid xs={12} md={8}>
          {/* To'lov jadvali */}
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
              totalPrice={contract.totalPrice} 
              payments={contract.payments}
              onPaymentSuccess={() => {
                dispatch(getContract(contract._id));
              }}
              customId={contract.customId}
            />
          )}
        </Grid>

        {/* Tahrirlash tarixi */}
        {contract?.editHistory && contract.editHistory.length > 0 && (
          <Grid xs={12}>
            <EditHistory editHistory={contract.editHistory} />
          </Grid>
        )}
      </Grid>
      <PayCommentModal
        open={selectedComment}
        onClose={() => setSelectedComment("")}
      />
      
        {contract && (
          <ContractDateEditModal
            open={dateEditModalOpen}
            onClose={() => setDateEditModalOpen(false)}
            contractId={contract._id}
            currentStartDate={contract.startDate}
            onSuccess={() => {
              dispatch(getContract(contract._id));
              setDateEditModalOpen(false);
            }}
          />
        )}
    </DashboardContent>
  );
};

export default ContractDetails;
