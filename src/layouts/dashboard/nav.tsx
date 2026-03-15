
import type { TypedUseSelectorHook } from "react-redux";
import type { Theme, SxProps } from "@mui/material/styles";

import { useEffect } from "react";
import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Drawer, { drawerClasses } from "@mui/material/Drawer";

import { navData } from "@/layouts/config-nav-dashboard";
import type { RootState } from "@/store";
import { usePathname } from "@/routes/hooks";
import { Logo } from "@/components/logo";
import { Scrollbar } from "@/components/scrollbar";
import { RouterLink } from "@/routes/components";

export type NavContentProps = {
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavMobile({
  sx,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: "unset",
          bgcolor: "var(--layout-nav-bg)",
          width: "var(--layout-nav-mobile-width)",
          ...sx,
        },
      }}>
      <NavContent slots={slots ?? {}} />
    </Drawer>
  );
}

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function NavContent({ slots, sx }: NavContentProps) {
  const pathname = usePathname();

  const { profile } = useTypedSelector((state) => state.auth);
  const roleNavItems = profile?.role ? navData[profile.role] : [];
  return (
    <>
      <Logo />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          display="flex"
          flex="1 1 auto"
          flexDirection="column"
          sx={sx ?? {}}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {roleNavItems.map((item) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    sx={{
                      px: 2,
                      py: "6px",
                      gap: "0.5rem",
                      borderRadius: 0,
                      typography: "body2",
                      fontWeight: "fontWeightMedium",
                      color: "var(--layout-nav-item-color)",
                      minHeight: "var(--layout-nav-item-height)",
                      "&:hover": {
                        bgcolor: "var(--layout-nav-item-hover-bg)",
                        color: "var(--layout-nav-item-hover-color)",
                      },
                      ...(isActived && {
                        fontWeight: "fontWeightSemiBold",
                        bgcolor: "var(--layout-nav-item-active-bg)",
                        color: "var(--layout-nav-item-active-color)",
                        "&:hover": {
                          bgcolor: "var(--layout-nav-item-active-bg)",
                          color: "var(--layout-nav-item-active-color)",
                        },
                      }),
                    }}>
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" flexGrow={1}>
                      {item.title}
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
