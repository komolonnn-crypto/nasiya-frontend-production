import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Button,
  Container,
  Typography,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";

import { Warning, DeleteForever, Refresh } from "@mui/icons-material";
import authApi from "@/server/auth";
import type { RootState } from "@/store";

interface ResetStats {
  customers: number;
  contracts: number;
  payments: number;
  debtors: number;
  expenses: number;
  totalBalance: {
    dollar: number;
    sum: number;
  };
}

export function ResetView() {
  const { profile } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<ResetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [checkingContracts, setCheckingContracts] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSuperAdmin = profile.role === "admin";

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate(`/${profile.role}`);
    }
  }, [isSuperAdmin, navigate, profile.role]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await authApi.get("/reset/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error("Statistika yuklashda xatolik:", err);
      setError(err.response?.data?.message || "Statistika yuklanmadi");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authApi.post("/reset/all");

      if (response.data.success) {
        setSuccess(response.data.message);
        setOpenDialog(false);
        await loadStats();
      }
    } catch (err: any) {
      console.error("Reset xatolik:", err);
      setError(
        err.response?.data?.message || "Ma'lumotlarni tozalashda xatolik",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckContracts = async () => {
    try {
      setCheckingContracts(true);
      setError(null);
      setSuccess(null);

      const response = await authApi.post("/reset/check-contracts");

      if (response.data.success) {
        const { updatedCount, completedCount, activeCount } = response.data;
        setSuccess(
          `Tekshiruv tugadi: ${updatedCount} ta shartnoma yangilandi (${completedCount} ta to'langan, ${activeCount} ta faol)`,
        );
        await loadStats();
      }
    } catch (err: any) {
      console.error("Check contracts xatolik:", err);
      setError(
        err.response?.data?.message || "Shartnomalarni tekshirishda xatolik",
      );
    } finally {
      setCheckingContracts(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 3 }}>
        {}
        <Box>
          <Typography variant="h4" gutterBottom>
            Tizimni Tozalash
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Barcha mijozlar, shartnomalar, to'lovlar va balanslarni tozalash
          </Typography>
        </Box>

        {}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {}
        <Card
          sx={{
            p: 3,
            bgcolor: "rgba(var(--palette-error-mainChannel) / 0.1)",
          }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Warning sx={{ fontSize: 40, color: "error.main" }} />
            <Box>
              <Typography variant="h6" color="error.main" gutterBottom>
                Diqqat! Bu amal qaytarib bo'lmaydi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reset tugmasini bosganda barcha mijozlar, shartnomalar,
                to'lovlar, qarzdorlar, xarajatlar va balanslar butunlay
                o'chiriladi. Bu amalni faqat test ma'lumotlarini tozalash uchun
                ishlating.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="h6">Joriy Statistika</Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={loadStats}
                disabled={statsLoading}>
                Yangilash
              </Button>
            </Stack>

            {statsLoading ?
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            : stats ?
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {stats.customers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mijozlar
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {stats.contracts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shartnomalar
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {stats.payments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      To'lovlar
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {stats.debtors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qarzdorlar
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {stats.expenses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xarajatlar
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h6" color="success.main">
                      ${stats.totalBalance.dollar.toLocaleString()}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {stats.totalBalance.sum.toLocaleString()} so'm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jami Balans
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            : <Alert severity="info">Statistika mavjud emas</Alert>}
          </Stack>
        </Card>

        {}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={
              checkingContracts ? <CircularProgress size={20} /> : <Refresh />
            }
            onClick={handleCheckContracts}
            disabled={checkingContracts || !stats}
            sx={{ minWidth: 200 }}>
            {checkingContracts ?
              "Tekshirilmoqda..."
            : "Shartnomalarni Tekshirish"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<DeleteForever />}
            onClick={() => setOpenDialog(true)}
            disabled={loading || !stats}
            sx={{ minWidth: 200 }}>
            Tizimni Tozalash
          </Button>
        </Stack>

        {}
        <Dialog
          open={openDialog}
          onClose={() => !loading && setOpenDialog(false)}>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Warning color="error" />
              <span>Tasdiqlash</span>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Haqiqatan ham barcha ma'lumotlarni o'chirmoqchimisiz? Bu amal
              qaytarib bo'lmaydi!
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "background.neutral",
                borderRadius: 0,
              }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                O'chiriladigan ma'lumotlar:
              </Typography>
              <Typography variant="body2">
                • {stats?.customers} ta mijoz
              </Typography>
              <Typography variant="body2">
                • {stats?.contracts} ta shartnoma
              </Typography>
              <Typography variant="body2">
                • {stats?.payments} ta to'lov
              </Typography>
              <Typography variant="body2">
                • {stats?.debtors} ta qarzdor
              </Typography>
              <Typography variant="body2">
                • {stats?.expenses} ta xarajat
              </Typography>
              <Typography variant="body2">
                • Barcha balanslar 0 ga qaytariladi
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight="bold">
                • Barcha yuklangan fayllar (passport, photo, shartnoma)
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight="bold">
                • Barcha Excel fayllar
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} disabled={loading}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleReset}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <DeleteForever />
              }>
              {loading ? "Tozalanmoqda..." : "Ha, Tozalash"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}
