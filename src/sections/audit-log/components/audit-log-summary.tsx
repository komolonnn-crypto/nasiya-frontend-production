import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Skeleton,
} from "@mui/material";

import { Dayjs } from "dayjs";
import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  loading?: boolean;
}

const COLOR_ALPHA_BG: Record<string, string> = {
  primary: "rgba(var(--palette-primary-mainChannel) / 0.12)",
  secondary: "rgba(var(--palette-secondary-mainChannel) / 0.12)",
  success: "rgba(var(--palette-success-mainChannel) / 0.12)",
  warning: "rgba(var(--palette-warning-mainChannel) / 0.12)",
  error: "rgba(var(--palette-error-mainChannel) / 0.12)",
  info: "rgba(var(--palette-info-mainChannel) / 0.12)",
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  loading,
}: SummaryCardProps) {
  if (loading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" height={32} />
            <Skeleton variant="text" height={20} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
      }}>
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: COLOR_ALPHA_BG[color] || COLOR_ALPHA_BG["primary"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: `${color}.main`,
            }}>
            <Iconify icon={icon} width={24} />
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="h3" component="div">
              {value.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

interface AuditLogSummaryProps {
  summary: {
    date: string;
    summary: {
      totalActivities: number;
      customers: {
        created: number;
        updated: number;
      };
      contracts: {
        created: number;
        updated: number;
      };
      payments: {
        total: number;
        confirmed: number;
        rejected: number;
      };
      excel_imports: number;
      users: {
        active: number;
        logins: number;
      };
    };
    recentActivities: any[];
  } | null;
  loading: boolean;
  selectedDate: Dayjs;
}

export default function AuditLogSummary({
  summary,
  loading,
  selectedDate,
}: AuditLogSummaryProps) {
  const isToday = selectedDate.isSame(new Date(), "day");
  const dateText = isToday ? "Bugun" : selectedDate.format("DD.MM.YYYY");

  if (!summary && !loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            {dateText} uchun ma'lumotlar topilmadi
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Umumiy faoliyat */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Umumiy faoliyat"
          value={summary?.summary.totalActivities || 0}
          subtitle={`${dateText} davomida`}
          icon="eva:activity-fill"
          color="primary"
          loading={loading}
        />
      </Grid>

      {/* Mijozlar */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Mijozlar"
          value={summary?.summary.customers.created || 0}
          subtitle={`${summary?.summary.customers.updated || 0} ta tahrirlangan`}
          icon="eva:people-fill"
          color="success"
          loading={loading}
        />
      </Grid>

      {/* Shartnomalar */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Shartnomalar"
          value={summary?.summary.contracts.created || 0}
          subtitle={`${summary?.summary.contracts.updated || 0} ta tahrirlangan`}
          icon="eva:file-text-fill"
          color="warning"
          loading={loading}
        />
      </Grid>

      {/* To'lovlar */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="To'lovlar"
          value={summary?.summary.payments.total || 0}
          subtitle={`${summary?.summary.payments.confirmed || 0} tasdiqlangan, ${summary?.summary.payments.rejected || 0} rad etilgan`}
          icon="eva:credit-card-fill"
          color="info"
          loading={loading}
        />
      </Grid>

      {/* Excel Import */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Excel Import"
          value={summary?.summary.excel_imports || 0}
          subtitle="Import operatsiyalari"
          icon="eva:cloud-upload-fill"
          color="secondary"
          loading={loading}
        />
      </Grid>

      {/* Faol foydalanuvchilar */}
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Faol foydalanuvchilar"
          value={summary?.summary.users.active || 0}
          subtitle={`${summary?.summary.users.logins || 0} ta kirish`}
          icon="eva:person-done-fill"
          color="success"
          loading={loading}
        />
      </Grid>

      {/* Placeholder cards for better layout */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            height: "100%",
            border: "2px dashed",
            borderColor: "grey.300",
          }}>
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%", minHeight: 140 }}>
              <Iconify
                icon="eva:plus-circle-outline"
                width={32}
                color="grey.500"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center">
                Qo'shimcha metrika
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            height: "100%",
            border: "2px dashed",
            borderColor: "grey.300",
          }}>
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%", minHeight: 140 }}>
              <Iconify
                icon="eva:plus-circle-outline"
                width={32}
                color="grey.500"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center">
                Qo'shimcha metrika
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
