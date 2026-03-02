import type { RootState } from "@/store";
import type { Breakpoint } from "@mui/material/styles";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppBarProps } from "@mui/material/AppBar";
import type { ToolbarProps } from "@mui/material/Toolbar";
import type { ContainerProps } from "@mui/material/Container";

import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import { ListItem, ListItemButton } from "@mui/material";

import { usePathname } from "@/routes/hooks";
import { RouterLink } from "@/routes/components";

import { bgBlur, varAlpha } from "@/theme/styles";

import { layoutClasses } from "@/layouts/classes";
import { navData } from "@/layouts/config-nav-dashboard";

// ----------------------------------------------------------------------

export type HeaderSectionProps = AppBarProps & {
  layoutQuery?: Breakpoint;
  slots?: {
    leftArea?: React.ReactNode;
    rightArea?: React.ReactNode;
    topArea?: React.ReactNode;
    centerArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  slotProps?: {
    toolbar?: ToolbarProps;
    container?: ContainerProps;
  };
};

type DataType = {
  path: string;
  title: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function HeaderSection({
  sx,
  slots,
  slotProps,
  layoutQuery = "md",
  ...other
}: HeaderSectionProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { profile } = useTypedSelector((state) => state.auth);
  const roleNavItems = profile?.role ? navData[profile?.role] : [];
  
  const toolbarStyles = {
    default: {
      ...bgBlur({
        color: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
      }),
      minHeight: "auto",
      height: "var(--layout-header-mobile-height)",
      transition: theme.transitions.create(["height", "background-color"], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      [theme.breakpoints.up(layoutQuery)]: {
        height: "var(--layout-header-desktop-height)",
      },
    },
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      className={layoutClasses.header}
      sx={{ boxShadow: "none", zIndex: "var(--layout-header-zIndex)", ...sx }}
      {...other}
    >
      {slots?.topArea}

      <Toolbar
        disableGutters
        {...slotProps?.toolbar}
        sx={{ ...toolbarStyles.default, ...slotProps?.toolbar?.sx }}
      >
        <Container
          {...slotProps?.container}
          sx={{
            height: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: `rgba(var(--palette-background-defaultChannel) / 0.75)`,
            backdropFilter: "saturate(200%) blur(30px)",
            borderBottom: "0.5px solid rgba(255, 255, 255, 0.08)",
            ...slotProps?.container?.sx,
          }}
        >
          {slots?.leftArea}

          {/* NAV PILL CONTAINER (TRACK) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              p: "4px",
              borderRadius: "12px",
              bgcolor: "var(--layout-nav-item-hover-bg)", // Container background
            }}
          >
            {roleNavItems.map((item: DataType) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title} sx={{ width: 'auto' }}>
                  <ListItemButton
                    component={RouterLink}
                    href={item.path}
                    sx={{
                      px: 2,
                      py: "6px",
                      gap: "8px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "12px",
                      whiteSpace: 'nowrap',
                      color: "var(--layout-nav-item-color)",
                      bgcolor: "transparent", // Set to transparent so it matches the track
                      transition: (theme) => theme.transitions.create(['all'], { duration: '0.2s' }),
                      
                      "&:hover": {
                        color: "var(--layout-nav-item-hover-color)",
                        bgcolor: "rgba(255, 255, 255, 0.04)",
                      },

                      ...(isActived && {
                        bgcolor: "var(--layout-nav-item-active-bg)",
                        color: "var(--layout-nav-item-active-color)",
                        boxShadow: (theme) => theme.palette.mode === 'dark' 
                            ? "0 4px 12px rgba(0,0,0,0.4)" 
                            : "0 3px 8px rgba(0, 0, 0, 0.1)",
                        "&:hover": {
                          bgcolor: "var(--layout-nav-item-active-bg)",
                        },
                      }),
                    }}
                  >
                    <Box component="span" sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>

                    <Box component="span">{item.title}</Box>

                    {item.info && (
                        <Box component="span" sx={{ ml: 0.5 }}>{item.info}</Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>

          {slots?.rightArea}
        </Container>
      </Toolbar>
    </AppBar>
  );
}