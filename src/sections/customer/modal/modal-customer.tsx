import type { FC } from "react";
import type { RootState } from "@/store";

import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  Stack,
  Button,
  Dialog,
  TextField,
  IconButton,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import { FaPassport } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { TbPhoto } from "react-icons/tb";
import { MdDelete, MdUpload } from "react-icons/md";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import authApi from "@/server/auth";
import { closeModal } from "@/store/slices/modalSlice";
import { getManagers } from "@/store/actions/employeeActions";
import { addCustomer, updateCustomer } from "@/store/actions/customerActions";

interface IForm {
  fullName: string;
  passportSeries: string;
  phoneNumber: string;
  address: string;
  birthDate: Date | null;
  managerId: string;
  passportFile: File | null;
  shartnomaFile: File | null;
  photoFile: File | null;
}

interface IProps {
  show?: boolean;
}

const ModalCustomer: FC<IProps> = ({ show = false }) => {
  const dispatch = useAppDispatch();
  const { customerModal } = useSelector((state: RootState) => state.modal);
  const { managers, isLoading } = useSelector(
    (state: RootState) => state.employee,
  );

  const [phoneError, setPhoneError] = useState(false);
  const [phoneHelper, setPhoneHelper] = useState("");
  const [passportError, setPassportError] = useState(false);
  const [passportHelper, setPassportHelper] = useState("");
  const [checking, setChecking] = useState(false);

  const customer = customerModal || {};

  const defaultFormValues: IForm = {
    fullName: "",
    passportSeries: "",
    phoneNumber: "+998",
    address: "",
    birthDate: null,
    managerId: "",
    passportFile: null,
    shartnomaFile: null,
    photoFile: null,
  };

  const [formValues, setFormValues] = useState<IForm>(defaultFormValues);

  useEffect(() => {
    if (customerModal?.type === "edit" && customer.data) {
      setFormValues({
        fullName: customer.data.fullName || "",
        passportSeries: customer.data.passportSeries || "",
        phoneNumber: customer.data.phoneNumber || "+998",
        address: customer.data.address || "",
        birthDate:
          customer.data.birthDate ? new Date(customer.data.birthDate) : null,
        managerId: customer.data.manager?._id || "",
        passportFile: null,
        shartnomaFile: null,
        photoFile: null,
      });
    }
  }, [customer, customerModal?.type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    let newValue: string | Date = value;

    if (name === "birthDate") {
      newValue = new Date(value);
    }

    if (name === "passportSeries") {
      newValue = value.toUpperCase();
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (!input.startsWith("+998")) return;

    const formatted = input.replace(/[^\d+]/g, "");

    if (formatted.length > 13) return;

    setFormValues((prev) => ({
      ...prev,
      phoneNumber: formatted,
    }));
  };

  useEffect(() => {
    const phone = formValues.phoneNumber;

    if (/^\+998\d{9}$/.test(phone)) {
      setPhoneHelper("");
      setPhoneError(false);
      if (customer?.data?.phoneNumber !== formValues.phoneNumber) {
        const checkPhone = async () => {
          try {
            setChecking(true);
            const phoneNumber = phone.replace("+", "");
            const res = await authApi.get(
              `/customer/check-phone?phone=${phoneNumber}`,
            );
            if (res.data.exists) {
              setPhoneError(true);
              setPhoneHelper("Bu telefon raqam allaqachon mavjud");
            }
          } catch (err) {
            setPhoneError(true);
            setPhoneHelper("Server bilan bog‘lanishda xatolik");
          } finally {
            setChecking(false);
          }
        };

        checkPhone();
      }
    } else {
      setPhoneError(false);
      setPhoneHelper("");
    }
  }, [formValues.phoneNumber]);

  const handlePhoneBlur = () => {
    const phone = formValues.phoneNumber;
    if (!/^\+998\d{9}$/.test(phone)) {
      setPhoneError(true);
      setPhoneHelper("Telefon raqam to‘liq va +998 bilan boshlanishi kerak");
    }
  };

  useEffect(() => {
    const passport = formValues.passportSeries;

    if (/^[A-Z]{2}\d{7}$/.test(passport)) {
      if (customer?.data?.passportSeries !== formValues.passportSeries) {
        const checkPassport = async () => {
          try {
            const res = await authApi.get(
              `/customer/check-passport?passport=${passport}`,
            );
            if (res.data.exists) {
              setPassportError(true);
              setPassportHelper("Bu passport seriyasi allaqachon mavjud");
            } else {
              setPassportError(false);
              setPassportHelper("");
            }
          } catch (err) {
            setPassportError(true);
            setPassportHelper("Server bilan bog‘lanishda xatolik");
          }
        };

        checkPassport();
      }
    } else {
      setPassportError(false);
      setPassportHelper("");
    }
  }, [formValues.passportSeries]);

  const handlePassportBlur = () => {
    const passport = formValues.passportSeries;

    if (!/^[A-Z]{2}\d{7}$/.test(passport)) {
      setPassportError(true);
      setPassportHelper(
        "2 ta harf va 7 ta raqamdan iborat bo‘lishi kerak (masalan: AA1234567)",
      );
    }
  };

  const handleClose = useCallback(() => {
    setFormValues(defaultFormValues);
    dispatch(closeModal("customerModal"));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData();
      formData.append("fullName", formValues.fullName);
      formData.append("passportSeries", formValues.passportSeries);
      formData.append("phoneNumber", formValues.phoneNumber);
      formData.append("address", formValues.address);
      formData.append("managerId", formValues.managerId);

      if (formValues.birthDate) {
        formData.append("birthDate", formValues.birthDate.toISOString());
      }

      if (customerModal?.type === "edit" && customer.data?._id) {
        formData.append("id", customer.data._id);
      }

      if (formValues.passportFile) {
        formData.append("passport", formValues.passportFile);
      }
      if (formValues.shartnomaFile) {
        formData.append("shartnoma", formValues.shartnomaFile);
      }
      if (formValues.photoFile) {
        formData.append("photo", formValues.photoFile);
      }

      if (customerModal?.type === "edit") {
        dispatch(updateCustomer(formData, customer.data?._id));
      } else {
        dispatch(addCustomer(formData, show));
      }

      handleClose();
    },
    [formValues, customer, customerModal?.type, dispatch, handleClose, show],
  );

  const handleCustomerFocus = useCallback(() => {
    dispatch(getManagers());
  }, [managers.length, dispatch]);

  const isFormValid =
    formValues.fullName.trim() !== "" &&
    (formValues.passportSeries === "" ||
      /^[A-Z]{2}\d{7}$/.test(formValues.passportSeries)) &&
    (formValues.phoneNumber === "" ||
      /^\+998\d{9}$/.test(formValues.phoneNumber)) &&
    formValues.managerId !== "" &&
    !phoneError &&
    !passportError &&
    !checking;

  return (
    <Dialog
      open={!!customerModal?.type}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
      fullWidth>
      {!!customerModal?.type && (
        <>
          <DialogTitle>
            {customerModal?.type === "edit" ?
              "Mijozni Tahrirlash"
            : "Yangi Mijoz Qo'shish"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              <Grid xs={12}>
                <TextField
                  value={formValues.fullName}
                  onChange={handleChange}
                  autoFocus
                  required
                  margin="dense"
                  id="fullName"
                  name="fullName"
                  label="Mijoz ismi"
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  value={formValues.passportSeries}
                  onChange={handleChange}
                  onBlur={handlePassportBlur}
                  margin="dense"
                  id="passportSeries"
                  name="passportSeries"
                  label="Passport seriyasi"
                  fullWidth
                  error={passportError}
                  helperText={passportHelper}
                  inputProps={{
                    maxLength: 9,
                  }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  value={formValues.phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  required
                  margin="dense"
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Telefon raqam"
                  fullWidth
                  error={phoneError}
                  helperText={phoneHelper}
                  inputProps={{
                    maxLength: 13,
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  value={
                    formValues.birthDate ?
                      formValues.birthDate.toISOString().split("T")[0]
                    : ""
                  }
                  onChange={handleChange}
                  margin="dense"
                  id="birthDate"
                  name="birthDate"
                  label="Tug'ilgan sana"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onKeyDown={(e) => e.preventDefault()}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  value={formValues.address}
                  onChange={handleChange}
                  margin="dense"
                  id="address"
                  name="address"
                  label="Manzil"
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid xs={12}>
                <Autocomplete
                  onFocus={handleCustomerFocus}
                  options={managers}
                  getOptionLabel={(option) => option.fullName || ""}
                  loading={isLoading}
                  loadingText="Yuklanmoqda..."
                  noOptionsText="Menejer topilmadi"
                  renderInput={(params) => {
                    const { size, InputLabelProps, ...restParams } = params;
                    const {
                      className: labelClassName,
                      style: labelStyle,
                      ...restLabelProps
                    } = InputLabelProps || {};

                    return (
                      <TextField
                        {...restParams}
                        {...(size && { size })}
                        label="Foydalanuvchini tanlang"
                        InputLabelProps={{
                          ...restLabelProps,
                          ...(labelClassName && { className: labelClassName }),
                          ...(labelStyle && { style: labelStyle }),
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoading ?
                                <CircularProgress color="inherit" size={20} />
                              : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    );
                  }}
                  onChange={(_event, value) => {
                    setFormValues((prev) => ({
                      ...prev,
                      managerId: value?._id || "",
                    }));
                  }}
                  value={
                    managers.find((m) => m._id === formValues.managerId) || null
                  }
                  sx={{ margin: "dense" }}
                />
              </Grid>

              <Grid xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
                  Yuklangan hujjatlar (ixtiyoriy)
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}>
                    <FaPassport size={20} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        Passport
                        {formValues.passportFile ?
                          `.${formValues.passportFile.name.split(".").pop()}`
                        : customer.data?.files?.passport ?
                          `.${customer.data.files.passport.split(".").pop()}`
                        : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formValues.passportFile ?
                          formValues.passportFile.name
                        : customer.data?.files?.passport ?
                          "Mavjud fayl"
                        : "Fayl yuklanmagan"}
                      </Typography>
                    </Box>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      id="passport-file-input"
                      type="file"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        setFormValues((prev) => ({
                          ...prev,
                          passportFile: file,
                        }));
                      }}
                    />
                    <label htmlFor="passport-file-input">
                      <IconButton component="span" color="primary" size="small">
                        <MdUpload />
                      </IconButton>
                    </label>
                    {(formValues.passportFile ||
                      customer.data?.files?.passport) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setFormValues((prev) => ({
                            ...prev,
                            passportFile: null,
                          }));
                        }}>
                        <MdDelete />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}>
                    <FaRegFileLines size={20} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        Shartnoma
                        {formValues.shartnomaFile ?
                          `.${formValues.shartnomaFile.name.split(".").pop()}`
                        : customer.data?.files?.shartnoma ?
                          `.${customer.data.files.shartnoma.split(".").pop()}`
                        : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formValues.shartnomaFile ?
                          formValues.shartnomaFile.name
                        : customer.data?.files?.shartnoma ?
                          "Mavjud fayl"
                        : "Fayl yuklanmagan"}
                      </Typography>
                    </Box>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      id="shartnoma-file-input"
                      type="file"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        setFormValues((prev) => ({
                          ...prev,
                          shartnomaFile: file,
                        }));
                      }}
                    />
                    <label htmlFor="shartnoma-file-input">
                      <IconButton component="span" color="primary" size="small">
                        <MdUpload />
                      </IconButton>
                    </label>
                    {(formValues.shartnomaFile ||
                      customer.data?.files?.shartnoma) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setFormValues((prev) => ({
                            ...prev,
                            shartnomaFile: null,
                          }));
                        }}>
                        <MdDelete />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}>
                    <TbPhoto size={20} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        Foto
                        {formValues.photoFile ?
                          `.${formValues.photoFile.name.split(".").pop()}`
                        : customer.data?.files?.photo ?
                          `.${customer.data.files.photo.split(".").pop()}`
                        : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formValues.photoFile ?
                          formValues.photoFile.name
                        : customer.data?.files?.photo ?
                          "Mavjud fayl"
                        : "Fayl yuklanmagan"}
                      </Typography>
                    </Box>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      id="photo-file-input"
                      type="file"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        setFormValues((prev) => ({
                          ...prev,
                          photoFile: file,
                        }));
                      }}
                    />
                    <label htmlFor="photo-file-input">
                      <IconButton component="span" color="primary" size="small">
                        <MdUpload />
                      </IconButton>
                    </label>
                    {(formValues.photoFile || customer.data?.files?.photo) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setFormValues((prev) => ({
                            ...prev,
                            photoFile: null,
                          }));
                        }}>
                        <MdDelete />
                      </IconButton>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={handleClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              color={
                (
                  customerModal?.type === "edit" &&
                  !customerModal.data?.isActive
                ) ?
                  "success"
                : "primary"
              }
              {...(!isFormValid && { disabled: true })}>
              {customerModal?.type === "edit" && !customerModal.data?.isActive ?
                "Tasdiqlash"
              : "Saqlash"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ModalCustomer;
