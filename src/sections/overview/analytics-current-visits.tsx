import type { CardProps } from "@mui/material/Card";
import type { ChartOptions } from "@/components/chart";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import { fNumber } from "@/utils/format-number";
import { Chart, useChart, ChartLegends } from "@/components/chart";
import { Box } from "@mui/material";

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsCurrentVisits({
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { 
      width: 2, 
      colors: [isDark ? theme.palette.background.paper : "#ffffff"] 
    },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName} $` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    ...chart.options,
  });

  return (
    <Card
      {...other}
      sx={{
        height: "100%",
        p: "1.5rem",
        bgcolor: "background.paper",
        borderRadius: "18px",
        backgroundImage: "none",
        boxShadow: isDark 
          ? "0 4px 20px 0 rgba(0,0,0,0.4)" 
          : "0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 14px rgba(0, 0, 0, 0.03), 0 15px 35px rgba(0, 0, 0, 0.05)",
        border: `0.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0, 0, 0, 0.08)"}`,
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        display: 'flex',
        flexDirection: 'column',
        ...other.sx,
      }}
    >
      <Typography 
        sx={{ 
          textTransform: "uppercase", 
          fontWeight: "900", // Matches your Bar Chart title weight
          fontSize: "0.75rem", // Matches Bar Chart title size
          lineHeight: "1rem", 
          color: "var(--layout-nav-item-color)", // Matches sidebars/header labels
          mb: 1
        }}
      >
        {title}
      </Typography>

      {subheader && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
          {subheader}
        </Typography>
      )}
      
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Chart
          type="pie"
          series={chartSeries}
          options={chartOptions}
          width={{ xs: 240, xl: 260 }}
          height={{ xs: 240, xl: 260 }}
          sx={{ my: 3, mx: "auto" }}
        />
      </Box>

      <Divider sx={{ borderStyle: "dashed", my: 2 }} />

      <ChartLegends
        {...(chartOptions?.labels && { labels: chartOptions.labels })}
        {...(chartOptions?.colors && { colors: chartOptions.colors })}
        sx={{ 
          px: 1, 
          pb: 1, 
          justifyContent: "center",
          '& .MuiTypography-root': {
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary'
          }
        }}
      />
    </Card>
  );
}