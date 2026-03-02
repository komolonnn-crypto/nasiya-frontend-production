import type { RootState } from "@/store"

import { useEffect } from "react";
import { useSelector } from "react-redux";

import { Skeleton, Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import { useAppDispatch } from "@/hooks/useAppDispatch"

import { formatNumber } from "@/utils/format-number"

import { DashboardContent } from "@/layouts/dashboard"
import {
  getDashboard,
  getCurrencyCourse,
} from "@/store/actions/dashboardActions";

import Loader from "@/components/loader/Loader"

import { AnalyticsCurrentVisits } from "@/sections/overview/analytics-current-visits";
import { AnalyticsWebsiteVisits } from "@/sections/overview/analytics-website-visits";
import { AnalyticsWidgetSummary } from "@/sections/overview/analytics-widget-summary";

export function OverviewAnalyticsView() {
  const dispatch = useAppDispatch();
  const { dashboard, isLoading, isLoadingStatistic } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { currency } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboard());
    dispatch(getCurrencyCourse());

    const interval = setInterval(() => {
      dispatch(getDashboard());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (dashboard == null && isLoading) {
    return <Loader />;
  }
  return (
    <DashboardContent maxWidth="xl">
      {/* <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashbord
      </Typography> */}

      {/* <Grid container spacing={{ xs: 2, sm: 2.5, md: 3, }}> */}
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Xodimlar"
            total={dashboard?.employees || 0}
            color="secondary"
            icon={
              <img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />
            }
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Mijozlar"
            total={dashboard?.customers || 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Shartnomalar"
            total={dashboard?.contracts || 0}
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Qarzdorlar"
            total={dashboard?.debtors || 0}
            color="error"
            icon={
              <img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />
            }
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Kassa ($)"
            total={dashboard?.totalBalance.dollar || 0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/currency.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          {dashboard?.totalBalance.hasCurrencyRate &&
          dashboard?.totalBalance.sum !== null ? (
            <AnalyticsWidgetSummary
              title="Umumiy Balans (UZS)"
              total={dashboard.totalBalance.sum}
              color="success"
              icon={<img alt="icon" src="/assets/icons/glass/currency.png" />}
            />
          ) : (
            <Box
              sx={{
                p: 3,
                borderRadius: 0,
                bgcolor: "rgba(var(--palette-warning-mainChannel) / 0.1)",
                border: "1px dashed",
                borderColor: "rgba(var(--palette-warning-mainChannel) / 0.5)",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="warning.main" gutterBottom>
                Balans (sum)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dollar kursini to'g'irlang
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="USD/UZS"
            total={currency}
            color="info"
            currency={currency}
            icon={
              <img
                alt="icon"
                src="/assets/icons/glass/currency.png"
                style={{
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
                }}
              />
            }
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} display="flex" alignItems="center">
          <AnalyticsWidgetSummary
            title="Dollar kurs"
            total={currency}
            color="info"
            currency={currency}
            icon={
              <img
                alt="icon"
                src="/assets/icons/glass/currency.png"
                style={{
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
                }}
              />
            }
            node
          />
        </Grid>

        <Grid xs={12} md={12} lg={4}>
          <AnalyticsCurrentVisits
            title={`Jami Summa ${formatNumber(dashboard?.financial.totalContractPrice || 0)}$`}
            chart={{
              series: [
                {
                  label: "Boshlang'ich Summa",
                  value: dashboard?.financial.initialPayment || 0,
                },
                {
                  label: "To'langan Summa",
                  value: dashboard?.financial.paidAmount || 0,
                },
                {
                  label: "Qoldiq Summa",
                  value: dashboard?.financial.remainingDebt || 0,
                },
              ],
            }}
          />
        </Grid>
        <Grid xs={12} md={12} lg={8}>
          {!isLoadingStatistic ? (
            <AnalyticsWebsiteVisits />
          ) : (
            <Skeleton variant="rounded" width="100%" height="100%" />
          )}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
