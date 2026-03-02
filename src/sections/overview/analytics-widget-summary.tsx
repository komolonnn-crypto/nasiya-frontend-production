import type { CardProps } from "@mui/material/Card";
import type { ColorType } from "@/theme/core/palette";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { Stack, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { formatNumber } from "@/utils/format-number";
import { setModal } from "@/store/slices/modalSlice";
import { varAlpha } from "@/theme/styles";
import { Iconify } from "@/components/iconify";
import { SvgColor } from "@/components/svg-color";

type Props = CardProps & {
  title: string;
  total: number;
  currency?: number;
  color?: ColorType;
  icon: React.ReactNode;
  node?: React.ReactNode;
};

export function AnalyticsWidgetSummary({
  icon,
  title,
  total,
  currency,
  color = "primary",
  sx,
  node,
  ...other
}: Props) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        minHeight: "85px",
        width: "100%",
        p: 2,
        position: "relative",
        borderRadius: "18px",
        bgcolor: "background.paper", // Automatically dark/light
        backgroundImage: "none",
        
        // Consistent shadow with other dashboard components
        boxShadow: isDark 
          ? "0 4px 20px 0 rgba(0,0,0,0.4)" 
          : "0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 14px rgba(0, 0, 0, 0.03), 0 15px 35px rgba(0, 0, 0, 0.05)",
        
        border: `0.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0, 0, 0, 0.08)"}`,
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        ...sx,
      }}
      {...other}
    >
      {node ? (
        <Box sx={{ overflow: 'hidden', borderRadius: '12px' }}>
          <a
            href="https://bank.uz/currency/cb.html"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://bank.uz/scripts/informer"
              alt="Dollar kursi"
              style={{
                maxWidth: "100%",
                height: "85px",
                filter: isDark ? 'invert(0.9) hue-rotate(180deg)' : 'none', // Subtle dark mode adjustment for the external image
              }}
            />
          </a>
        </Box>
      ) : (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
          >
            <Box
              sx={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
                // Color mapping: uses widget color with low opacity
                bgcolor: varAlpha(theme.palette[color].mainChannel, 0.12),
                color: theme.palette[color].main,
                border: `1px solid ${varAlpha(theme.palette[color].mainChannel, 0.1)}`,
                boxShadow: `0 4px 8px ${varAlpha(theme.palette[color].mainChannel, 0.08)}`,
              }}
            >
              {icon}
            </Box>

            {currency !== undefined && currency >= 0 && (
              <IconButton
                size="small"
                onClick={() => {
                  dispatch(
                    setModal({
                      modal: "dashboardModal",
                      data: { type: "edit", data: currency },
                    }),
                  );
                }}
                sx={{ 
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  '&:hover': { bgcolor: 'var(--layout-nav-item-active-bg)' } 
                }}
              >
                <Iconify icon="solar:pen-bold" width={16} />
              </IconButton>
            )}
          </Stack>

          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography
              sx={{
                color: "var(--layout-nav-item-color)",
                fontWeight: "900",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {title}
            </Typography>
            
            <Typography
              sx={{
                fontSize: "1.5rem",
                lineHeight: "1.2",
                color: "text.primary", // Auto white in dark mode
                fontWeight: "900",
              }}
            >
              {formatNumber(total)}
            </Typography>
          </Box>

          {/* Background Decorative Icon */}
          <SvgColor
            src=""
            sx={{
              top: -20,
              right: -20,
              width: 160,
              height: 160,
              opacity: isDark ? 0.08 : 0.12,
              position: "absolute",
              color: theme.palette[color].main,
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
    </Card>
  );
}