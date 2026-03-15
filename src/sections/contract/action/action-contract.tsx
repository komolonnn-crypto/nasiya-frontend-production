import { useState, useCallback } from "react";

import { MdDelete } from "react-icons/md";
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
  Popover,
  MenuList,
  MenuItem,
  menuItemClasses,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { setModal } from "@/store/slices/modalSlice";

import type { IContract } from "@/types/contract";
import type { RootState } from "@/store";

import { Iconify } from "@/components/iconify";
import { getContract, deleteContract } from "@/store/actions/contractActions";

export default function ActionContract({ contract }: { contract: IContract }) {
  const dispatch = useAppDispatch();
  const { profile } = useSelector((state: RootState) => state.auth);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );
  const [deleteDialog, setDeleteDialog] = useState(false);

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
    dispatch(getContract(contract._id));
    dispatch(
      setModal({
        modal: "contractModal",
        data: { type: "edit", data: contract },
      }),
    );
    handleClosePopover();
  }, [dispatch, contract, handleClosePopover]);

  const handleDelete = useCallback(() => {
    dispatch(deleteContract(contract._id));
    setDeleteDialog(false);
    handleClosePopover();
  }, [dispatch, contract._id, handleClosePopover]);

  contract.status === "active";
  const isAdmin = profile?.role === "admin";
  const isModerator = profile?.role === "moderator";
  const canDelete = isAdmin || isModerator;

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

          {canDelete && (
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
        </MenuList>
      </Popover>

      {}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdDelete color="var(--palette-error-main)" size={24} />
          Shartnomani o&lsquo;chirish
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ⚠️ <strong>OGOHLANTIRISH:</strong> Bu amal QAYTARIB BO&lsquo;LMAYDI!
          </DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(var(--palette-error-mainChannel) / 0.1)",
              borderRadius: 1,
              border: "2px solid",
              borderColor: "rgba(var(--palette-error-mainChannel) / 0.4)",
            }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mijoz:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {contract.customer?.fullName || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mahsulot:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {contract.productName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Umumiy narx:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${contract.totalPrice}
                </Typography>
              </Box>

              <Box
                sx={{ mt: 2, p: 1.5, bgcolor: "error.dark", borderRadius: 1 }}>
                <Typography variant="body2" color="white" fontWeight="bold">
                  ❌ O&lsquo;chiriladi:
                </Typography>
                <Typography
                  variant="caption"
                  color="white"
                  component="div"
                  sx={{ mt: 0.5 }}>
                  • Shartnoma (tiklab bo&lsquo;lmaydi)
                </Typography>
                <Typography variant="caption" color="white" component="div">
                  • Barcha to&lsquo;lovlar
                </Typography>
                <Typography variant="caption" color="white" component="div">
                  • Qarzdorlar ro&lsquo;yxati
                </Typography>
                <Typography variant="caption" color="white" component="div">
                  • Barcha izohlar (notes)
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DialogContentText
            sx={{ mt: 2, color: "error.main", fontWeight: "bold" }}>
            Tasdiqlaysizmi?
          </DialogContentText>
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
    </>
  );
}
