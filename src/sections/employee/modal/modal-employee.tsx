import type { RootState } from "@/store";
import type { SelectChangeEvent } from "@mui/material";
import type { IAddEmployee, IEditEmployee } from "@/types/employee";

import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

import Grid from "@mui/material/Unstable_Grid2";
import {
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  IconButton,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  InputAdornment,
} from "@mui/material";

import { useAppDispatch } from "@/hooks/useAppDispatch";

import { closeModal } from "@/store/slices/modalSlice";
import { enqueueSnackbar } from "@/store/slices/snackbar";
import { addEmployee, updateEmployee } from "@/store/actions/employeeActions";

interface IForm {
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const ModalEmployee = () => {
  const dispatch = useAppDispatch();
  const { employeeModal } = useSelector((state: RootState) => state.modal);
  const employee = employeeModal || {};

  const [phoneError, setPhoneError] = useState(false);
  const [phoneHelper, setPhoneHelper] = useState("");

  const defaultFormValues: IForm = {
    firstName: "",
    lastName: "",
    role: "",
    phoneNumber: "+998",
    password: "",
    confirmPassword: "",
  };

  const [formValues, setFormValues] = useState<IForm>(defaultFormValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormValues((prev) => ({
      ...prev,
      role: e.target.value as string,
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

  const handlePhoneBlur = () => {
    const phone = formValues.phoneNumber;
    if (!/^\+998\d{9}$/.test(phone)) {
      setPhoneError(true);
      setPhoneHelper("Telefon raqam to‘liq va +998 bilan boshlanishi kerak");
    }
  };

  const handleClose = useCallback(() => {
    setFormValues(defaultFormValues);
    dispatch(closeModal("employeeModal"));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (
        !formValues.firstName ||
        !formValues.phoneNumber ||
        !formValues.role
      ) {
        dispatch(
          enqueueSnackbar({
            message: "Iltimos, barcha maydonlarni to'ldiring!",
            options: { variant: "error" },
          }),
        );
        return;
      }

      if (!/^\+998\d{9}$/.test(formValues.phoneNumber)) {
        dispatch(
          enqueueSnackbar({
            message: "Telefon raqam noto'g'ri formatda!",
            options: { variant: "error" },
          }),
        );
        return;
      }

      if (employeeModal?.type !== "edit") {
        if (!formValues.password || formValues.password.length < 6) {
          alert("Parol kamida 6 belgidan iborat bo'lishi kerak!");
          return;
        }
        if (formValues.password !== formValues.confirmPassword) {
          alert("Parollar mos emas!");
          return;
        }
      }

      const formData = {
        ...formValues,
        id: employee.data?._id,
        ...(employeeModal?.type === "edit" &&
          !formValues.password && {
            password: undefined,
          }),
      };

      if (employeeModal?.type === "edit") {
        dispatch(updateEmployee(formData as unknown as IEditEmployee));
      } else {
        dispatch(addEmployee(formData as unknown as IAddEmployee));
      }

      handleClose();
    },
    [formValues, employee, employeeModal, dispatch, handleClose],
  );

  useEffect(() => {
    const phone = formValues.phoneNumber;

    if (/^\+998\d{9}$/.test(phone)) {
      setPhoneError(false);
      setPhoneHelper("");
    }
  }, [formValues.phoneNumber]);

  useEffect(() => {
    if (employeeModal?.type === "edit" && employee) {
      setFormValues({
        firstName: employee.data?.firstName || "",
        lastName: employee.data?.lastName || "",
        role: employee.data?.role || "",
        phoneNumber: employee.data?.phoneNumber || "+998",
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [employee, employeeModal?.type]);

  return (
    <Dialog
      open={!!employeeModal?.type}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>
        {employeeModal?.type === "edit" ?
          "Xodimni Tahrirlash"
        : "Yangi Xodim Qo'shish"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <TextField
              value={formValues.firstName}
              onChange={handleChange}
              autoFocus
              required
              margin="dense"
              id="firstName"
              name="firstName"
              label="Ismi"
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              value={formValues.lastName}
              onChange={handleChange}
              margin="dense"
              id="lastName"
              name="lastName"
              label="Familiyasi"
              fullWidth
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

          <Grid xs={12} md={6}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="role-label">Lavozimi</InputLabel>
              <Select
                labelId="role-label"
                value={formValues.role}
                onChange={handleSelectChange}
                name="role"
                label="Lavozimi"
                fullWidth>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="seller">Sotuvchi</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {}
          {employeeModal?.type !== "edit" && (
            <>
              <Grid xs={12}>
                <TextField
                  value={formValues.password}
                  onChange={handleChange}
                  required
                  margin="dense"
                  id="password"
                  name="password"
                  label="Parol"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end">
                          {showPassword ?
                            <MdVisibilityOff />
                          : <MdVisibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  required
                  margin="dense"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Parolni tasdiqlang"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end">
                          {showConfirmPassword ?
                            <MdVisibilityOff />
                          : <MdVisibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}

          {employeeModal?.type === "edit" && (
            <>
              <Grid xs={12}>
                <TextField
                  value={formValues.password}
                  onChange={handleChange}
                  margin="dense"
                  id="password"
                  name="password"
                  label="Yangi parol (agar o'zgartirmoqchi bo'lsangiz)"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end">
                          {showPassword ?
                            <MdVisibilityOff />
                          : <MdVisibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {formValues.password && (
                <Grid xs={12}>
                  <TextField
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    margin="dense"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Yangi parolni tasdiqlang"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end">
                            {showConfirmPassword ?
                              <MdVisibilityOff />
                            : <MdVisibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleClose}>
          Bekor qilish
        </Button>
        <Button type="submit">Saqlash</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEmployee;
