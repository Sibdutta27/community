import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Button,
  Paper,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import { useUser, useUpdateUser } from "../hooks/useUser";

import UserConsents from "../components/UserConsents/UserConsents";

import styles from "./editUser.module.css";

const USER_ROLES = ["USER", "ADMIN", "MODERATOR"];

/**
 * Validation schema
 */
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  role: z.enum(["USER", "ADMIN", "MODERATOR"]),

  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .optional()
    .or(z.literal("")),
});

const EditUser = () => {
  const { id: userId } = useParams();

  /**
   * Fetch user
   */
  const { data: userData } = useUser(userId);

  /**
   * Update mutation
   */
  const { mutateAsync: updateUserMut, isPending: updatingUser } =
    useUpdateUser();

  /**
   * Form
   */
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      name: "",
      role: "USER",
      password: "",
    },
  });

  /**
   * Reset form
   */
  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || "",
        role: userData.role || "USER",
        password: "",
      });
    }
  }, [userData, reset]);

  /**
   * Submit
   */
  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      role: data.role,
    };

    /**
     * Only send password if entered
     */
    if (data.password?.trim()) {
      payload.password = data.password;
    }

    try {
      await updateUserMut({
        id: userId,
        data: payload,
      });

      toast.success("User updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user";

      toast.error(message);
    }
  };

  return (
    <section className={styles.page}>
      <Typography variant="h4" className={styles.title}>
        Edit User
      </Typography>

      <Paper className={styles.formContainer}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          {/* Public ID */}
          <TextField
            label="Public ID"
            value={userData?.publicId || ""}
            fullWidth
            disabled
          />

          {/* Email */}
          <TextField
            label="Email"
            value={userData?.email || ""}
            fullWidth
            disabled
          />

          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          {/* Role */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Role</InputLabel>

                <Select {...field} label="Role">
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText>{errors.role?.message}</FormHelperText>
              </FormControl>
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="New Password (Optional)"
                fullWidth
                error={!!errors.password}
                helperText={
                  errors.password?.message ||
                  "Leave empty to keep current password"
                }
              />
            )}
          />

          <Button type="submit" variant="contained" disabled={updatingUser}>
            {updatingUser ? "Updating..." : "Update User"}
          </Button>
        </Box>
      </Paper>

      <UserConsents userId={userId} />
    </section>
  );
};

export default EditUser;
