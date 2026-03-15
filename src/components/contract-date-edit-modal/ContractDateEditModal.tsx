

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { alpha, useTheme } from "@mui/material/styles";

import { Iconify } from "@/components/iconify";
import type { RootState } from "@/store";
import authApi from "@/server/auth";

interface ContractDateEditModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  currentStartDate: Date | string;
  onSuccess?: () => void;
}

interface PreviewData {
  oldStartDate: string;
  newStartDate: string;
  dateDifference: {
    days: number;
    months: number;
  };
  affectedPayments: Array<{
    paymentId: string;
    type: string;
    targetMonth?: number;
    oldDate: string;
    newDate: string;
    isPaid: boolean;
    willChange?: boolean;
  }>;
  affectedDebtors: Array<{
    debtorId: string;
    oldDueDate: string;
    newDueDate: string;
    debtAmount: number;
  }>;
}

export default function ContractDateEditModal({
  open,
  onClose,
  contractId,
  currentStartDate,
  onSuccess,
}: ContractDateEditModalProps) {
  const { profile } = useSelector((state: RootState) => state.auth);
  const userRole = (typeof profile?.role === 'string' ? profile.role : (profile?.role as any)?.name)?.toLowerCase();

  const isAuthorized = userRole === "admin" || userRole === "moderator";

  const [newStartDate, setNewStartDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewStartDate(dayjs(currentStartDate));
      setReason("");
      setPreviewData(null);
      setError(null);
    }
  }, [open, currentStartDate]);

  const handlePreview = async () => {
    if (!newStartDate) {
      setError("Yangi sanani tanlang");
      return;
    }

    setPreviewLoading(true);
    setError(null);

    try {
      const response = await authApi.post(
        `/contract/preview-date-change`,
        {
          contractId,
          newStartDate: newStartDate.toISOString(),
        }
      );

      setPreviewData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Preview olishda xatolik yuz berdi"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newStartDate) {
      setError("Yangi sanani tanlang");
      return;
    }

    if (!previewData) {
      setError("Iltimos, avval preview tugmasini bosing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.post(
        `/contract/update-start-date`,
        {
          contractId,
          newStartDate: newStartDate.toISOString(),
          reason: reason || "Sana o'zgartirildi",
        }
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Shartnoma sanasini o'zgartirishda xatolik yuz berdi"
      );
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();

  if (!isAuthorized) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ py: 5, textAlign: 'center' }}>
          <Iconify icon="solar:shield-warning-bold-duotone" width={64} color="error.main" sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>Kirish taqiqlangan</Typography>
          <Typography variant="body2" color="text.secondary">
            Faqat Admin va Moderator shartnoma sanasini o'zgartira oladi.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" fullWidth>Yopish</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.customShadows?.z24 || 24,
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px dashed ${theme.palette.divider}`
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}>
            <Iconify icon="solar:calendar-edit-bold-duotone" width={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>Shartnoma boshlanish sanasi</Typography>
            <Typography variant="caption" color="text.secondary">Tizimdagi barcha to'lov grafiklari o'zgarishi mumkin</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert 
                severity="error" 
                variant="filled" 
                onClose={() => setError(null)}
                sx={{ borderRadius: 1 }}
              >
                {error}
              </Alert>
            )}

            <Alert 
              severity="warning" 
              variant="outlined"
              icon={<Iconify icon="solar:danger-bold-duotone" />}
              sx={{ 
                borderStyle: 'dashed', 
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                color: 'warning.darker',
                '& .MuiAlert-icon': { color: 'warning.main' }
              }}
            >
              <strong>Diqqat!</strong> Shartnoma sanasini o'zgartirish barcha to'lovlar va qarzdorlar sanalarini zanjirsimon ravishda o'zgartiradi!
            </Alert>

            <Box sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              bgcolor: 'background.neutral',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="overline" color="text.secondary">Joriy sana</Typography>
                <Typography variant="h6">{dayjs(currentStartDate).format("DD.MM.YYYY")}</Typography>
              </Box>
              <Iconify icon="solar:arrow-right-bold-duotone" width={24} color="text.disabled" />
              <Box sx={{ minWidth: 200 }}>
                <DatePicker
                  label="Yangi sana"
                  value={newStartDate}
                  onChange={(date) => {
                    setNewStartDate(date);
                    setPreviewData(null);
                  }}
                  format="YYYY-MM-DD"
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      required: true,
                      inputProps: { type: 'date' }
                    },
                  }}
                />
              </Box>
            </Box>

            <TextField
              label="O'zgartirish sababi"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Masalan: Xato kiritilgan yoki mijoz so'rovi bo'yicha..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04)
                }
              }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handlePreview}
              disabled={!newStartDate || previewLoading}
              startIcon={<Iconify icon={previewLoading ? "eos-icons:loading" : "solar:eye-bold-duotone"} />}
              sx={{
                py: 1.5,
                borderRadius: 1.5,
                boxShadow: theme.customShadows?.primary || 0
              }}
            >
              Ta'sir tahlilini yuklash
            </Button>
          </Stack>

            {previewData && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:chart-square-bold-duotone" color="primary.main" />
                  Kutilayotgan o'zgarishlar
                </Typography>

                <Stack spacing={2}>
                  <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                      <Typography variant="caption" display="block" color="info.dark" sx={{ mb: 0.5, fontWeight: 700 }}>FARQ (KUN)</Typography>
                      <Typography variant="h5">{previewData.dateDifference.days > 0 ? `+${previewData.dateDifference.days}` : previewData.dateDifference.days} kun</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                      <Typography variant="caption" display="block" color="primary.dark" sx={{ mb: 0.5, fontWeight: 700 }}>O'ZGARADIGAN TO'LOVLAR</Typography>
                      <Typography variant="h5">
                        {previewData.affectedPayments.filter(p => p.willChange !== false).length} / {previewData.affectedPayments.length} ta
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                      <Typography variant="caption" display="block" color="warning.dark" sx={{ mb: 0.5, fontWeight: 700 }}>QARZDORLAR</Typography>
                      <Typography variant="h5">{previewData.affectedDebtors.length} ta</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    maxHeight: 250, 
                    overflowY: 'auto', 
                    borderRadius: 1.5, 
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.grey[500], 0.02)
                  }}>
                    <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 1 }}>
                      <Typography variant="subtitle2">Grafikdagi o'zgarishlar (namuna)</Typography>
                    </Box>
                    <Stack spacing={0} divider={<Divider />}>
                      {previewData.affectedPayments
                        .sort((a, b) => {
                          if (a.willChange === b.willChange) return 0;
                          return a.willChange ? -1 : 1;
                        })
                        .slice(0, 10)
                        .map((payment) => {
                        const willChange = payment.willChange !== false;
                        
                        return (
                          <Box 
                            key={payment.paymentId} 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              bgcolor: willChange ? 'transparent' : alpha(theme.palette.grey[500], 0.04),
                              opacity: willChange ? 1 : 0.6
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ 
                                width: 8, height: 8, borderRadius: '50%', 
                                bgcolor: payment.isPaid ? 'success.main' : 'warning.main' 
                              }} />
                              <Typography variant="body2">{payment.type} ({payment.targetMonth || 0}-oy)</Typography>
                              {payment.isPaid && (
                                <Chip 
                                  label="To'langan" 
                                  size="small" 
                                  color="success"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography 
                                variant="caption" 
                                color="text.disabled" 
                                sx={{ textDecoration: willChange ? 'line-through' : 'none' }}
                              >
                                {dayjs(payment.oldDate).format("DD.MM.YYYY")}
                              </Typography>
                              <Iconify 
                                icon="solar:double-alt-arrow-right-bold-duotone" 
                                color={willChange ? "text.disabled" : "grey.400"} 
                                width={14} 
                              />
                              {willChange ? (
                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                  {dayjs(payment.newDate).format("DD.MM.YYYY")}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                                  Saqlanadi
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        );
                      })}
                      {previewData.affectedPayments.length > 10 && (
                        <Box sx={{ p: 1, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                          <Typography variant="caption" color="text.secondary">... va yana {previewData.affectedPayments.length - 10} ta to'lov</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Alert 
                    severity="info" 
                    icon={<Iconify icon="solar:check-circle-bold-duotone" />}
                    sx={{ borderRadius: 1 }}
                  >
                    Ma'lumotlar tahlil qilindi. O'zgarishlarni tasdiqlash uchun "Saqlash" tugmasini bosing.
                  </Alert>
                </Stack>
              </Box>
            )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 1 }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newStartDate || !previewData || loading}
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:diskette-bold-duotone" />}
            sx={{ 
              borderRadius: 1,
              px: 4,
              boxShadow: theme.customShadows?.primary ?? {}
            }}
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
