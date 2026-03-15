import { useState, useCallback } from "react";

import { IconButton } from "@mui/material";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { closeExpense } from "@/store/actions/employeeActions";

import { Iconify } from "@/components/iconify";

export default function ActionExpense({
  id,
  employeeId,
  page,
  limit,
}: {
  id: string;
  employeeId: string;
  page: number;
  limit: number;
}) {
  const dispatch = useAppDispatch();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
    },
    [],
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleSelect = useCallback(() => {
    dispatch(closeExpense(id, employeeId, page + 1, limit));

    handleClosePopover();
  }, [dispatch, employeeId, handleClosePopover, id, limit, page]);

  return (
    <>
      <IconButton onClick={handleOpenPopover} sx={{ color: "text.primary" }}>
        <Iconify icon="eva:more-vertical-fill" width={22} />
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: "flex",
            flexDirection: "column",
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0,
              [`&.${menuItemClasses.selected}`]: { bgcolor: "action.selected" },
            },
          }}>
          <MenuItem onClick={handleSelect}>
            <Iconify icon="solar:refresh-circle-linear" />
            Yopish
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
