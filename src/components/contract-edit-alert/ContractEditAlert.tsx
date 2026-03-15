import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import { Iconify } from "@/components/iconify"

interface ContractEditNotification {
  _id: string;
  contractId: string;
  contractNumber: string;
  customerName: string;
  editedBy: string;
  editDate: string;
  changes: Array<{
    field: string;
    oldValue: number;
    newValue: number;
  }>;
  impactSummary: {
    underpaidCount: number;
    overpaidCount: number;
    additionalPaymentsCreated: number;
  };
}

interface ContractEditAlertProps {
  notification: ContractEditNotification;
  onViewContract?: (contractId: string) => void;
  onViewPayments?: (contractId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

const ContractEditAlert: React.FC<ContractEditAlertProps> = ({
  notification,
  onViewContract,
  onViewPayments,
  onDismiss,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm");
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      monthlyPayment: "Oylik to'lov",
      initialPayment: "Boshlang'ich to'lov",
      totalPrice: "Umumiy narx",
    };
    return fieldNames[field] || field;
  };

  return (
    <Alert
      severity="info"
      icon={<Iconify icon="mdi:file-document-edit" />}
      sx={{ mb: 2 }}
      action={
        onDismiss && (
          <IconButton
            size="small"
            onClick={() => onDismiss(notification._id)}
            aria-label="close"
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        )
      }
    >
      <AlertTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2">Shartnoma tahrirlandi</Typography>
          <Chip
            label={`#${notification.contractNumber}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </AlertTitle>

      <Stack spacing={1}>
        <Typography variant="body2">
          <strong>Mijoz:</strong> {notification.customerName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Tahrirlagan:</strong> {notification.editedBy} •{" "}
          {formatDateTime(notification.editDate)}
        </Typography>

        {}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {notification.impactSummary.underpaidCount > 0 && (
            <Chip
              icon={<Iconify icon="mdi:alert-circle" />}
              label={`${notification.impactSummary.underpaidCount} kam to'langan`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
          {notification.impactSummary.overpaidCount > 0 && (
            <Chip
              icon={<Iconify icon="mdi:check-circle" />}
              label={`${notification.impactSummary.overpaidCount} ko'p to'langan`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {notification.impactSummary.additionalPaymentsCreated > 0 && (
            <Chip
              icon={<Iconify icon="mdi:plus-circle" />}
              label={`${notification.impactSummary.additionalPaymentsCreated} qo'shimcha to'lov`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>

        {}
        <Box>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={
              <Iconify
                icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
              />
            }
          >
            {expanded ? "Yashirish" : "O'zgarishlarni ko'rish"}
          </Button>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1, pl: 2, borderLeft: 2, borderColor: "divider" }}>
              <Stack spacing={0.5}>
                {notification.changes.map((change, idx) => (
                  <Typography key={idx} variant="body2">
                    <strong>{formatFieldName(change.field)}:</strong> $
                    {change.oldValue} → ${change.newValue}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Collapse>
        </Box>

        {}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {onViewContract && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-document" />}
              onClick={() => onViewContract(notification.contractId)}
            >
              Shartnomani ko'rish
            </Button>
          )}
          {onViewPayments && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:cash-multiple" />}
              onClick={() => onViewPayments(notification.contractId)}
            >
              To'lovlarni ko'rish
            </Button>
          )}
        </Stack>
      </Stack>
    </Alert>
  );
};

export default ContractEditAlert;
