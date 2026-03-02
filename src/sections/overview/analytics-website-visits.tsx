import type { RootState } from "@/store";
import type { ChartOptions } from "@/components/chart";

import { useSelector } from "react-redux";
import { useEffect } from "react";

import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { useTheme, alpha as hexAlpha } from "@mui/material/styles";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setGranularity } from "@/store/slices/dashboardSlice";
import { getStatistic } from "@/store/actions/dashboardActions";

import { Chart, useChart } from "@/components/chart";

type Granularity = "daily" | "monthly" | "yearly";

type ChartType = {
  colors?: string[];
  categories?: string[];
  series: {
    name: string;
    data: number[];
  }[];
  options?: ChartOptions;
};

export function AnalyticsWebsiteVisits() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dispatch = useAppDispatch();

  const { statistic, selectedGranularity } = useSelector(
    (state: RootState) => state.dashboard
  );

  const selectedStatistic = statistic[selectedGranularity];

  useEffect(() => {
    if (!selectedStatistic) {
      dispatch(getStatistic(selectedGranularity));
    }
  }, [dispatch, selectedGranularity, selectedStatistic]);

  const handleGranularityChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Granularity | null
  ) => {
    if (!value) return;
    dispatch(setGranularity(value));
  };

  const chart: ChartType = {
    categories: selectedStatistic?.categories || [],
    series: [
      {
        name: "To'lov",
        data:
          selectedStatistic?.series?.map((num: number) =>
            Number(num.toFixed(2))
          ) || [],
      },
    ],
  };

  // Chart bar color: Primary in light, Primary Light or Yellow in dark
  const chartColors = chart.colors ?? [
    isDark ? theme.palette.primary.light : theme.palette.primary.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chart.categories,
    },
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} $`,
      },
    },
    ...chart.options,
  });

  return (
    <Card
      sx={{
        height: "100%",
        p: "1.5rem",
        bgcolor: "background.paper", // Automatically switches color
        borderRadius: "18px",
        backgroundImage: "none",
        boxShadow: isDark 
          ? "0 4px 20px 0 rgba(0,0,0,0.4)" 
          : "0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 14px rgba(0, 0, 0, 0.03), 0 15px 35px rgba(0, 0, 0, 0.05)",
        border: `0.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0, 0, 0, 0.08)"}`,
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              lineHeight: "1rem",
              fontWeight: "900",
              textTransform: "uppercase",
              color: "var(--layout-nav-item-color)",
            }}
          >
            Oylik tranzaksiyalar
          </Typography>

          <Typography
            sx={{
              fontWeight: "700",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
              mt: "0.25rem",
              color: "text.primary", // Corrected for Dark Mode
            }}
          >
            To'lovlar dinamikasi (Oxirgi{" "}
            {selectedGranularity === "daily"
              ? "30 kun"
              : selectedGranularity === "monthly"
              ? "12 oy"
              : "5 yil"}
            )
          </Typography>
        </Box>

        {/* Toggle Container - Matches Header Nav Track */}
        <Box
          sx={{
            background: "var(--layout-nav-item-hover-bg)",
            borderRadius: "12px",
            padding: "4px",
            display: "inline-flex",
          }}
        >
          <ToggleButtonGroup
            value={selectedGranularity}
            exclusive
            onChange={handleGranularityChange}
            sx={{
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "10px",
                padding: "6px 16px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "12px",
                lineHeight: "18px",
                color: "var(--layout-nav-item-color)",
                bgcolor: "transparent",
                transition: "all 0.2s ease",

                "&:hover": {
                  color: "var(--layout-nav-item-hover-color)",
                  bgcolor: "rgba(255, 255, 255, 0.04)",
                },

                "&.Mui-selected": {
                  bgcolor: "var(--layout-nav-item-active-bg)",
                  color: "var(--layout-nav-item-active-color)", // THIS IS YELLOW IN DARK MODE
                  boxShadow: isDark 
                    ? "0 4px 12px rgba(0,0,0,0.4)" 
                    : "0 3px 8px rgba(0, 0, 0, 0.1)",
                  
                  "&:hover": {
                    bgcolor: "var(--layout-nav-item-active-bg)",
                    color: "var(--layout-nav-item-active-color)",
                  },
                },
              },
            }}
          >
            <ToggleButton value="daily">Kunlik</ToggleButton>
            <ToggleButton value="monthly">Oylik</ToggleButton>
            <ToggleButton value="yearly">Yillik</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {selectedStatistic &&
      chart.categories &&
      chart.categories.length > 0 ? (
        <Chart
          type="bar"
          series={chart.series}
          options={chartOptions}
          height={364}
        />
      ) : (
        <Box
          sx={{
            height: 364,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            fontSize: "14px"
          }}
        >
          Ma&apos;lumotlar yuklanmoqda...
        </Box>
      )}
    </Card>
  );
} 