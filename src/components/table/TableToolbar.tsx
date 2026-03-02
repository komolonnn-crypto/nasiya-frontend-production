import { MdSort, MdSearch, MdFilterList, MdViewColumn } from "react-icons/md";

import Grid from "@mui/material/Unstable_Grid2";
import { Box, Stack, Button, TextField, InputAdornment, useTheme } from "@mui/material";

interface TableToolbarProps {
  onFilterClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSortClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onColumnClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  component?: React.ReactNode;
  calendar?: React.ReactNode;
  uploadData?: React.ReactNode;
}

export function TableToolbar({
  onFilterClick,
  onSortClick,
  onColumnClick,
  searchText,
  onSearchChange,
  component,
  calendar,
  uploadData,
}: TableToolbarProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      display="flex"
      alignItems="center"
      px={1.5}
      py={1}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "background.paper",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
        p: "8px",
        borderRadius: "18px", // Matches Dashboard Card standards
        marginBottom: "12px",
        boxShadow: isDark 
          ? "0 8px 24px rgba(0,0,0,0.5)" 
          : "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)",
      }}
    >
      <Grid container spacing={1.5} width={1} alignItems="center">
        {/* QIDIRISH (SEARCH) SECTION */}
        <Grid xs={12} sm={6} md={component ? 3 : 6}>
          <TextField
            placeholder="Qidirish..."
            size="small"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              width: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", // Premium rounded look
                background: "var(--layout-nav-item-hover-bg)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "transparent"}`,
                fontWeight: 600,
                fontSize: "0.8125rem",
                height: "42px",
                transition: theme.transitions.create(['all']),
                "& fieldset": { border: "none" },
                "&.Mui-focused": {
                  background: isDark ? "#1C1C1E" : "#fff",
                  boxShadow: isDark 
                    ? "0 0 0 2px rgba(255,255,255,0.05)" 
                    : "0 0 0 3px rgba(0,122,255,0.1), 0 8px 24px rgba(0,0,0,0.06)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} color="var(--layout-nav-item-color)" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* COMPONENT SLOT (e.g., Manager Filter Dropdown) */}
        {component && (
          <Grid xs={12} sm={6} md={4} display="flex" justifyContent="center">
            <Box sx={{ 
              width: 1,
              // Applies border radius to whatever dropdown/input is inside the slot
              "& .MuiOutlinedInput-root": { borderRadius: "14px" },
              "& .MuiSelect-select": { py: '10px' }
            }}>
              {component}
            </Box>
          </Grid>
        )}

        {/* BUTTONS & CALENDAR SECTION */}
        <Grid xs={12} md={component ? 5 : 6}>
          <Stack
            width={1}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="end"
            spacing={1.5}
            alignItems="center"
          >
            {/* PILL-STYLE BUTTON GROUP */}
            <Box
              sx={{
                display: "inline-flex",
                gap: "4px",
                background: "var(--layout-nav-item-hover-bg)",
                p: "4px",
                borderRadius: "14px", // Rounded container
                border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
              }}
            >
              {[
                { label: "Filtr", icon: <MdFilterList size={14} />, onClick: onFilterClick },
                { label: "Saralash", icon: <MdSort size={14} />, onClick: onSortClick },
                { label: "Ustunlar", icon: <MdViewColumn size={14} />, onClick: onColumnClick },
              ].map((btn) => (
                <Button
                  key={btn.label}
                  onClick={btn.onClick}
                  startIcon={btn.icon}
                  disableRipple
                  sx={{
                    minWidth: 0,
                    px: "16px",
                    height: "34px",
                    borderRadius: "11px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--layout-nav-item-color)",
                    transition: theme.transitions.create(['all']),
                    "&:hover": {
                      background: isDark ? "rgba(255, 255, 255, 0.08)" : "#fff",
                      color: isDark ? "#fff" : "#111827",
                      boxShadow: isDark 
                        ? "0 4px 12px rgba(0,0,0,0.3)" 
                        : "0 2px 4px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>

            {calendar && (
                <Box sx={{ 
                    borderRadius: '14px', 
                    overflow: "hidden",
                    "& .MuiOutlinedInput-root": { borderRadius: "14px" } 
                }}>
                    {calendar}
                </Box>
            )}
            
            {uploadData && uploadData}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}