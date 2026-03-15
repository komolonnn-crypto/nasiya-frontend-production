import type { RootState, AppDispatch } from "@/store"
import type { IconButtonProps } from "@mui/material/IconButton";

import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { logout } from "@/store/actions/authActions"

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({
  data = [],
  sx,
  ...other
}: AccountPopoverProps) {
  const { profile } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null
  );

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const isAdmin = profile?.role === "admin";

  const handleResetClick = () => {
    handleClosePopover();
    navigate(`/${profile.role}/reset`);
  };

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: "2px",
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar
          src="/assets/images/avatar/avatar-25.webp"
          alt={profile?.firstname || "User"}
          sx={{ width: 1, height: 1 }}
        >
          {profile?.firstname?.charAt(0).toUpperCase() || "U"}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { width: 200, borderRadius: "10px" },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {profile?.firstname && profile?.lastname
              ? `${profile.firstname} ${profile.lastname}`
              : "Foydalanuvchi"}
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {profile?.phoneNumber || ""}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {isAdmin && (
            <Button
              fullWidth
              color="warning"
              size="medium"
              variant="outlined"
              onClick={handleResetClick}
              sx={{borderRadius:"10px"}}
            >
              Reset
            </Button>
          )}
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            onClick={() => {
              dispatch(logout());
            }}
            sx={{borderRadius:"10px"}}
          >
            Tizimdan chiqish
          </Button>
        </Box>
      </Popover>
    </>
  );
}
