import React from "react";
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
} from "@mui/material";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { Iconify } from "@/components/iconify"
import type { IContractEdit } from "@/types/contract"

interface EditHistoryProps {
  editHistory: IContractEdit[];
}

const EditHistory: React.FC<EditHistoryProps> = ({ editHistory }) => {
  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      monthlyPayment: "Oylik to'lov",
      initialPayment: "Boshlang'ich to'lov",
      totalPrice: "Umumiy narx",
      productName: "Mahsulot nomi",
      price: "Sotuv narxi",
      originalPrice: "Asl narxi",
      startDate: "Shartnoma sanasi",
      nextPaymentDate: "Keyingi to'lov sanasi",
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value: any, field: string): string => {
    if (field === 'startDate' || field === 'nextPaymentDate') {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return format(date, "dd.MM.yyyy", { locale: uz });
        }
      } catch (e) { /* ignore */ }
    }
    if (typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    return String(value);
  };

  const formatDifference = (change: any): string => {
    const field = change.field;
    const diff = change.difference;
    if (field === 'startDate' || field === 'nextPaymentDate') {
      const days = Math.abs(diff);
      if (days === 0) return "O'zgarmagan";
      return `${diff > 0 ? '+' : ''}${diff.toFixed(0)} kun`;
    }
    if (typeof diff === 'number') {
      return `${diff > 0 ? '+' : ''}$${diff.toFixed(2)}`;
    }
    return String(diff);
  };

  if (!editHistory || editHistory.length === 0) return null;

  return (
    <Card sx={{ p: 2, borderRadius: "18px" }}> {/* LARGE RADIUS */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Iconify icon="mdi:history" width={24} />
        <Typography variant="h6">Tahrirlash Tarixi</Typography>
        <Chip 
          label={`${editHistory.length} ta`} 
          size="small" 
          color="primary" 
          sx={{ borderRadius: "12px" }} // SMALL RADIUS
        />
      </Box>

      <Stack spacing={2}>
        {editHistory.map((edit, index) => (
          <Accordion 
            key={index} 
            defaultExpanded={index === 0}
            sx={{
              borderRadius: "12px !important", // SMALL RADIUS
              overflow: "hidden",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
              "&:before": { display: "none" }, // Remove MUI default line
            }}
          >
            <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={`#${editHistory.length - index}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: "12px" }} // SMALL RADIUS
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {edit.editedBy.firstName} {edit.editedBy.lastName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(edit.date), "dd MMM yyyy, HH:mm", { locale: uz })}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="primary.main">
                    O'zgarishlar:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Maydon</TableCell>
                          <TableCell align="right">Eski</TableCell>
                          <TableCell align="center">→</TableCell>
                          <TableCell align="right">Yangi</TableCell>
                          <TableCell align="right">Farq</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {edit.changes.map((change, idx) => (
                          <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">{formatFieldName(change.field)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">{formatValue(change.oldValue, change.field)}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Iconify icon="mdi:arrow-right" width={16} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">{formatValue(change.newValue, change.field)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={formatDifference(change)}
                                size="small"
                                sx={{ borderRadius: "8px" }} // Extra small internal elements
                                color={change.difference > 0 ? "success" : change.difference < 0 ? "error" : "default"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {edit.impactSummary && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">
                      Ta'sir:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
                      {edit.impactSummary.underpaidCount > 0 && (
                        <Chip
                          icon={<Iconify icon="mdi:alert-circle" />}
                          label={`${edit.impactSummary.underpaidCount} kam`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ borderRadius: "12px" }}
                        />
                      )}
                      {edit.impactSummary.totalShortage > 0 && (
                        <Chip
                          label={`-$${edit.impactSummary.totalShortage.toFixed(2)}`}
                          size="small"
                          color="error"
                          sx={{ borderRadius: "12px" }}
                        />
                      )}
                      {/* ... other chips follow same 12px pattern */}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Card>
  );
};

export default EditHistory;