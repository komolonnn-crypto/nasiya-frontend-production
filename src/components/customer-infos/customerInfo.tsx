import type { RootState } from "@/store"
import type { ICustomer } from "@/types/customer"

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { type FC, useState, useEffect, useCallback } from "react";

import {
  Box,
  Chip,
  List,
  Stack,
  Avatar,
  Button,
  Dialog,
  Divider,
  Tooltip,
  ListItem,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  Autocomplete,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  DialogContentText,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch"

import { setModal } from "@/store/slices/modalSlice"
import { setEmployeeId } from "@/store/slices/employeeSlice"
import { getManagers } from "@/store/actions/employeeActions"
import { confirmationCustomer } from "@/store/actions/customerActions"

import { Iconify } from "@/components/iconify";

interface IProps {
  customer: ICustomer | null;
  top?: boolean;
}

const CustomerInfo: FC<IProps> = ({ customer, top = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { managers, isLoading } = useSelector(
    (state: RootState) => state.employee
  );
  
  // ✅ Role tekshirish - faqat admin va moderator manager o'zgartirishi mumkin
  const { profile } = useSelector((state: RootState) => state.auth);
  const userRole = (typeof profile?.role === 'string' ? profile.role : (profile?.role as any)?.name)?.toLowerCase();
  const canEditManager = userRole === "admin" || userRole === "moderator";
  const currentManager = customer?.manager
    ? managers.find((manager) => manager._id === customer.manager?._id)
    : null;

  const [selectedManager, setSelectedManager] = useState<
    (typeof managers)[0] | null
  >(currentManager ?? null);

  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    dispatch(getManagers());
  }, [dispatch]);

  useEffect(() => {
    if (customer?.manager) {
      const manager = managers.find((m) => m._id === customer.manager?._id);
      setSelectedManager(manager || null);
    } else {
      setSelectedManager(null);
    }
  }, [customer, managers]);

  // const handleCustomerFocus = useCallback(() => {
  //   // if (!hasFetchedManager.current && managers.length === 0) {
  //   dispatch(getManagers());
  //   //   hasFetchedManager.current = true;
  //   // }
  // }, [dispatch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!customer || !selectedManager) return;

      // Agar mijoz hali tasdiqlanmagan bo'lsa, dialog ko'rsatish
      if (!customer.isActive) {
        setConfirmDialog(true);
      } else {
        // Agar faqat menејerni o'zgartirish bo'lsa, to'g'ridan-to'g'ri saqlash
        const formJson = {
          customerId: customer._id,
          managerId: selectedManager._id,
        };
        dispatch(confirmationCustomer(formJson));
      }
    },
    [customer, selectedManager, dispatch]
  );

  const handleConfirmCustomer = useCallback(() => {
    if (!customer || !selectedManager) return;

    const formJson = {
      customerId: customer._id,
      managerId: selectedManager._id,
    };

    dispatch(confirmationCustomer(formJson));
    setConfirmDialog(false);
  }, [customer, selectedManager, dispatch]);

  // const isFormValid = formValues.managerId;

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{ width: 50, height: 50 }} 
              {...(customer?.fullName && { alt: customer.fullName })}
            />
            <Typography variant="h6">
              {customer?.fullName || "___"}
            </Typography>
            {customer?.isActive ? (
              <Tooltip title="Tasdiqlangan mijoz" placement="top">
                <Typography>
                  <MdCheckCircle color="var(--palette-success-main)" />
                </Typography>
              </Tooltip>
            ) : (
              <Tooltip title="Hali tasdiqlanmagan" placement="top">
                <Typography>
                  <MdCancel color="var(--palette-error-main)" />
                </Typography>
              </Tooltip>
            )}
          </Stack>
          <Stack
            direction="row"
            width="full"
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <Autocomplete
              fullWidth
              // onFocus={handleCustomerFocus}
              options={managers}
              getOptionLabel={(option) =>
                option.fullName || `${option.firstName || ""} ${option.lastName || ""}`.trim() || ""
              }
              isOptionEqualToValue={(option, value) => option._id === value._id}
              loading={isLoading}
              loadingText="Yuklanmoqda..."
              noOptionsText="Menejer topilmadi"
              value={selectedManager}
              renderInput={(params) => {
                const { size, InputLabelProps, ...restParams } = params;
                const { className: labelClassName, style: labelStyle, ...restLabelProps } = InputLabelProps || {};
                
                return (
                  <TextField
                    {...restParams}
                    {...(size && { size })}
                    fullWidth
                    label="Menejer"
                    InputLabelProps={{
                      ...restLabelProps,
                      ...(labelClassName && { className: labelClassName }),
                      ...(labelStyle && { style: labelStyle }),
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                );
              }}
              onChange={(_event, value) => {
                setSelectedManager(value);
              }}
              {...(!canEditManager && { disabled: true })}
              sx={{ flex: 1 ,borderRadius: "12px" }}
              // ListboxProps={{
              //   style: {
              //     maxHeight: 300, // scroll chiqmasin desangiz buni olib tashlashingiz mumkin
              //   },
              // }}
            />
            <Button
              type="submit"
              color={!customer?.isActive ? "success" : "primary"}
              {...((!selectedManager && customer?.isActive) && { disabled: true })}
            >
              {!selectedManager ? "Tasdiqlash" : "Saqlash"}
            </Button>

            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => {
                dispatch(
                  setModal({
                    modal: "customerModal",
                    data: { type: "edit", data: customer },
                  })
                );
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Stack>
        </Stack>
        {!top && (
          <List dense>
            <ListItem>
              <ListItemText
                primary="Passport seriyasi"
                secondary={customer?.passportSeries || "___"}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Telefon raqami"
                secondary={customer?.phoneNumber || "___"}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Tug'ilgan sana"
                secondary={
                  customer?.birthDate
                    ? new Date(customer?.birthDate).toLocaleDateString()
                    : "___"
                }
              />
            </ListItem>

            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Manzil"
                secondary={customer?.address || "___"}
              />
            </ListItem>

            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Mas'ul menejer"
                secondary={
                  <Chip
                    avatar={<Avatar />}
                    label={customer?.manager?.fullName || "___"}
                    variant="outlined"
                    sx={{ mt: 1, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer?.manager?._id) {
                        dispatch(setEmployeeId(customer?.manager?._id || ""));
                        navigate("/admin/employee");
                      }
                    }}
                  />
                }
                secondaryTypographyProps={{
                  component: "div",
                }}
              />
            </ListItem>
          </List>
        )}
      </Stack>

      {/* Tasdiqlash Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdCheckCircle color="var(--palette-success-main)" size={24} />
          Mijozni tasdiqlash
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>
              {customer?.fullName}
            </strong>{" "}
            mijozini tasdiqlashni xohlaysizmi?
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mas'ul menejer:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
                {selectedManager?.fullName || `${selectedManager?.firstName || ""} ${selectedManager?.lastName || ""}`}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Tasdiqlangandan so'ng mijoz tizimda faol bo'ladi va shartnoma tuzish
            mumkin bo'ladi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDialog(false)}
            color="inherit"
            variant="outlined"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleConfirmCustomer}
            color="success"
            variant="contained"
            startIcon={<MdCheckCircle />}
          >
            Tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default CustomerInfo;
