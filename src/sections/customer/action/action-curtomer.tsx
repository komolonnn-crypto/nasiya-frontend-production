import type { ICustomer } from "@/types/customer";

import { useState, useCallback } from "react";
import { MdDelete, MdWarning, MdRefresh } from "react-icons/md";

import {
  Box,
  Stack,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { setModal } from "@/store/slices/modalSlice";
import {
  deleteCustomer,
  restorationCustomer,
} from "@/store/actions/customerActions";

import { Iconify } from "@/components/iconify";

export default function ActionCustomer({ customer }: { customer: ICustomer }) {
  const dispatch = useAppDispatch();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);

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
    dispatch(
      setModal({
        modal: "customerModal",
        data: { type: "edit", data: customer },
      }),
    );
    handleClosePopover();
  }, [dispatch, customer, handleClosePopover]);

  const handleDelete = useCallback(() => {
    dispatch(deleteCustomer(customer._id));
    setDeleteDialog(false);
    handleClosePopover();
  }, [dispatch, customer._id, handleClosePopover]);

  const restorationDelete = useCallback(() => {
    dispatch(restorationCustomer(customer._id));
    setRestoreDialog(false);
    handleClosePopover();
  }, [dispatch, customer._id, handleClosePopover]);
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
            <Iconify icon="solar:pen-bold" />
            Tahrirlash
          </MenuItem>
          {!customer.isDeleted && (
            <MenuItem
              onClick={() => {
                setDeleteDialog(true);
                handleClosePopover();
              }}
              sx={{ color: "error.main" }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              O`chirish
            </MenuItem>
          )}
          {customer.isDeleted && (
            <MenuItem
              onClick={() => {
                setRestoreDialog(true);
                handleClosePopover();
              }}
              sx={{ color: "success.main" }}>
              <Iconify icon="solar:refresh-circle-linear" />
              Tiklash
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      {}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdWarning color="var(--palette-warning-main)" size={24} />
          Mijozni o&lsquo;chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Haqiqatan ham mijozni o&lsquo;chirmoqchimisiz?
          </DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(var(--palette-error-mainChannel) / 0.1)",
              borderRadius: 0,
              border: "1px solid",
              borderColor: "rgba(var(--palette-error-mainChannel) / 0.3)",
            }}>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mijoz:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {customer.fullName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Telefon:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {customer.phoneNumber || "———"}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              bgcolor: "rgba(var(--palette-warning-mainChannel) / 0.1)",
              borderRadius: 0,
            }}>
            <MdWarning size={18} color="var(--palette-warning-main)" />
            <Typography
              variant="caption"
              color="warning.main"
              fontWeight="medium">
              Diqqat: O&lsquo;chirilgan mijozni keyinchalik tiklash mumkin.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            color="inherit"
            variant="outlined">
            Bekor qilish
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<MdDelete />}>
            O&lsquo;chirish
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={restoreDialog}
        onClose={() => setRestoreDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdRefresh color="var(--palette-success-main)" size={24} />
          Mijozni tiklash
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Mijozni tiklashni xohlaysizmi?</DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(var(--palette-success-mainChannel) / 0.1)",
              borderRadius: 0,
              border: "1px solid",
              borderColor: "rgba(var(--palette-success-mainChannel) / 0.3)",
            }}>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mijoz:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {customer.fullName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Telefon:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {customer.phoneNumber || "—"}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}>
            Tiklanganidan so&lsquo;ng mijoz qayta faol bo&lsquo;ladi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRestoreDialog(false)}
            color="inherit"
            variant="outlined">
            Bekor qilish
          </Button>
          <Button
            onClick={restorationDelete}
            color="success"
            variant="contained"
            startIcon={<MdRefresh />}>
            Tiklash
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
