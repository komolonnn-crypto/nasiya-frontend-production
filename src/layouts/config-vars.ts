import type { Theme } from "@mui/material/styles";
import { varAlpha } from "@/theme/styles";

export const baseVars = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";

  const activeYellow = "#FFD600";

  return {
    "--layout-nav-bg": isDark ? "#1C1C1E" : theme.vars.palette.background.paper,
    "--layout-nav-border-color":
      isDark ?
        "rgba(255,255,255,0.06)"
      : varAlpha(theme.vars.palette.grey["500Channel"], 0.08),
    "--layout-nav-zIndex": 1101,
    "--layout-nav-mobile-width": "320px",

    "--layout-nav-item-height": "34px",
    "--layout-nav-item-color": isDark ? "rgba(255,255,255,0.50)" : "#637381",

    "--layout-nav-item-hover-bg": isDark ? "rgba(0, 0, 0, 0.20)" : "#F2F2F7",
    "--layout-nav-item-hover-color": isDark ? "#FFFFFF" : "#212B36",

    "--layout-nav-item-active-bg":
      isDark ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF",
    "--layout-nav-item-active-color": isDark ? activeYellow : "#007AFF",

    "--layout-header-blur": "8px",
    "--layout-header-zIndex": 1100,
    "--layout-header-mobile-height": "64px",
    "--layout-header-desktop-height": "60px",
    "--radius-card": "24px",
    "--radius-button": "14px",
    "--radius-pill": "100px",

    "--layout-header-bg":
      isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
    "--border-thin":
      isDark ?
        "0.5px solid rgba(255, 255, 255, 0.1)"
      : "0.5px solid rgba(0, 0, 0, 0.08)",
  };
};
