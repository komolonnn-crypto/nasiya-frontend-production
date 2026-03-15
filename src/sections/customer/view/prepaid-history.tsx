import { useState, useEffect } from "react";

import {
  Box,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import axios from "axios";
import { MdHistory } from "react-icons/md";

interface IPrepaidRecord {
  _id: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  createdBy?: { firstName: string; lastName: string };
  customer?: { fullName: string };
  contract?: { customId: string; productName: string };
  notes?: string;
  createdAt: string;
}

interface PrepaidHistoryProps {
  customerId: string;
  contractId?: string;
}

export function PrepaidHistory({
  customerId,
  contractId,
}: PrepaidHistoryProps) {
  const [records, setRecords] = useState<IPrepaidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!customerId) return;

      setLoading(true);
      setError(null);

      try {
        const baseUrl =
          import.meta.env["VITE_API_BASE_URL"] || "http://localhost:3000";
        const token = localStorage.getItem("accessToken");

        let url = `${baseUrl}/api/dashboard/prepaid/history/${customerId}`;
        if (contractId) {
          url += `?contractId=${contractId}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.data) {
          setRecords(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching prepaid records:", err);
        setError("Zapas tarihini o'qishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [customerId, contractId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (records.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", bgcolor: "background.neutral" }}>
        <Typography color="text.secondary">Zapas tarihi mavjud emas</Typography>
      </Paper>
    );
  }

  const formatPaymentMethod = (method?: string): string => {
    const methods: { [key: string]: string } = {
      som_cash: "So'm naqd",
      som_card: "So'm karta",
      dollar_cash: "Dollar naqd",
      dollar_card_visa: "Dollar karta (Visa)",
    };
    return methods[method || ""] || method || "Noma'lum";
  };

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        {}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <MdHistory size={24} />
          <Typography variant="h6" fontWeight={700}>
            Zapas Tarixi
          </Typography>
          <Chip label={records.length} size="small" color="primary" />
        </Stack>

        {}
        <Paper
          sx={{
            p: 2,
            bgcolor: "rgba(var(--palette-info-mainChannel) / 0.1)",
            borderRadius: 1,
          }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Jami Zapas
          </Typography>
          <Typography variant="h5" fontWeight={700} color="info.main">
            ${totalAmount.toFixed(2)}
          </Typography>
        </Paper>

        {}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.neutral" }}>
                <TableCell>Sana</TableCell>
                <TableCell>Summa</TableCell>
                <TableCell>To'lov usuli</TableCell>
                <TableCell>Kim qo'shgan</TableCell>
                <TableCell>Ma'lumot</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(record.date).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="success.main">
                      ${record.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatPaymentMethod(record.paymentMethod)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.createdBy ?
                        `${record.createdBy.firstName || ""} ${record.createdBy.lastName || ""}`.trim()
                      : "Noma'lum"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {record.notes && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "300px",
                        }}
                        title={record.notes}>
                        {record.notes}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Card>
  );
}

export default PrepaidHistory;
