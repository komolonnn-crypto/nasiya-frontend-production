import { useState } from "react";

import {
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Box,
  Button,
  Skeleton,
  Paper,
  LinearProgress,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Iconify } from "@/components/iconify";

import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "@/types/auditlog-page-types";

interface StatsData {
  period: {
    start: string;
    end: string;
  };
  stats: {
    _id: string;
    actions: {
      action: string;
      count: number;
    }[];
    totalCount: number;
  }[];
}

interface AuditLogStatsProps {
  stats: StatsData | null;
  loading: boolean;
  onDateRangeChange: (start: string, end: string) => void;
}

export default function AuditLogStats({
  stats,
  loading,
  onDateRangeChange,
}: AuditLogStatsProps) {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(7, "day"));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const handleDateRangeUpdate = () => {
    onDateRangeChange(
      startDate.format("YYYY-MM-DD"),
      endDate.format("YYYY-MM-DD"),
    );
  };

  const handleQuickRange = (days: number) => {
    const end = dayjs();
    const start = end.subtract(days, "day");
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  };

  const totalActivities =
    stats?.stats.reduce((sum, entity) => sum + entity.totalCount, 0) || 0;
  const mostActiveEntity = stats?.stats.reduce(
    (max, entity) =>
      entity.totalCount > (max?.totalCount || 0) ? entity : max,
    stats.stats[0],
  );

  const quickRanges = [
    { label: "Oxirgi 7 kun", days: 7 },
    { label: "Oxirgi 30 kun", days: 30 },
    { label: "Oxirgi 90 kun", days: 90 },
  ];

  if (loading) {
    return (
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={200} height={56} />
                <Skeleton variant="rounded" width={200} height={56} />
                <Skeleton variant="rounded" width={120} height={56} />
              </Stack>
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Skeleton variant="rounded" height={200} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">Statistika davri</Typography>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap>
              <DatePicker
                label="Boshlanish sanasi"
                value={startDate}
                onChange={(date) => setStartDate(date!)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: { size: "small", sx: { minWidth: 160 } },
                }}
              />

              <DatePicker
                label="Tugash sanasi"
                value={endDate}
                onChange={(date) => setEndDate(date!)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: { size: "small", sx: { minWidth: 160 } },
                }}
              />

              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:search-fill" />}
                onClick={handleDateRangeUpdate}>
                Yangilash
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickRanges.map((range) => (
                <Button
                  key={range.days}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickRange(range.days)}>
                  {range.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor:
                        "rgba(var(--palette-primary-mainChannel) / 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                    }}>
                    <Iconify icon="eva:activity-fill" width={32} />
                  </Box>
                  <Typography variant="h3">
                    {totalActivities.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    textAlign="center">
                    Jami faoliyat
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center">
                    {dayjs(stats.period.start).format("DD.MM.YYYY")} -{" "}
                    {dayjs(stats.period.end).format("DD.MM.YYYY")}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor:
                        "rgba(var(--palette-success-mainChannel) / 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "success.main",
                    }}>
                    <Iconify icon="eva:trending-up-fill" width={32} />
                  </Box>
                  <Typography variant="h3">{stats.stats.length}</Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    textAlign="center">
                    Faol entity turlari
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center">
                    Turli xil obyekt turlari
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor:
                        "rgba(var(--palette-warning-mainChannel) / 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "warning.main",
                    }}>
                    <Iconify icon="eva:star-fill" width={32} />
                  </Box>
                  <Typography variant="h3">
                    {mostActiveEntity?.totalCount || 0}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    textAlign="center">
                    Eng faol entity
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center">
                    {mostActiveEntity ?
                      AUDIT_ENTITY_LABELS[
                        mostActiveEntity._id as keyof typeof AUDIT_ENTITY_LABELS
                      ]
                    : "Noma'lum"}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {}
      {stats && stats.stats.length > 0 ?
        <Grid container spacing={3}>
          {stats.stats.map((entityStat) => (
            <Grid item xs={12} md={6} key={entityStat._id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between">
                      <Typography variant="h6">
                        {AUDIT_ENTITY_LABELS[
                          entityStat._id as keyof typeof AUDIT_ENTITY_LABELS
                        ] || entityStat._id}
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {entityStat.totalCount}
                      </Typography>
                    </Stack>

                    <Stack spacing={1.5}>
                      {entityStat.actions.map((actionStat) => {
                        const percentage =
                          (actionStat.count / entityStat.totalCount) * 100;
                        return (
                          <Paper
                            key={actionStat.action}
                            sx={{ p: 2, bgcolor: "background.neutral" }}>
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between">
                                <Typography variant="subtitle2">
                                  {AUDIT_ACTION_LABELS[
                                    actionStat.action as keyof typeof AUDIT_ACTION_LABELS
                                  ] || actionStat.action}
                                </Typography>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    {actionStat.count}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    ({percentage.toFixed(1)}%)
                                  </Typography>
                                </Stack>
                              </Stack>

                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 0,
                                  bgcolor: "action.disabledBackground",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 0,
                                  },
                                }}
                              />
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      : !loading && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
                <Iconify
                  icon="eva:file-text-outline"
                  width={64}
                  sx={{ color: "text.disabled" }}
                />
                <Typography variant="h6" color="text.secondary">
                  Tanlangan davr uchun ma'lumotlar topilmadi
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center">
                  Boshqa sana oralig'ini tanlang yoki filterlarni o'zgartiring
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )
      }
    </Stack>
  );
}
