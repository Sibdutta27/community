// pages/Events/EditEvent/EditEvent.jsx

import { useEffect } from "react";

import { Link, useParams } from "react-router-dom";

import GroupsIcon from "@mui/icons-material/Groups";

import { Controller, useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import { useEvent, useUpdateEvent, useEventCategory } from "./hooks";

import CategorySelect from "../components/CategorySelect/CategorySelect";

import styles from "./editEvent.module.css";

/**
 * Options
 */
const LOCATION_TYPES = [
  {
    label: "Physical",
    value: "PHYSICAL",
  },

  {
    label: "Virtual",
    value: "VIRTUAL",
  },
];

const FEATURED_OPTIONS = [
  {
    label: "Featured",
    value: true,
  },

  {
    label: "Not Featured",
    value: false,
  },
];

/**
 * Validation schema
 */
const schema = z.object({
  title: z.string().min(2, "Title is required"),

  description: z.string().optional(),

  categoryId: z.string().min(1, "Category is required"),

  startDateTime: z.string().min(1, "Start date is required"),

  endDateTime: z.string().optional(),

  locationType: z.enum(["PHYSICAL", "VIRTUAL"]),

  location: z.string().optional(),

  meetingUrl: z.string().optional(),

  maxCapacity: z.union([z.number(), z.nan()]).optional(),

  externalUrl: z.string().optional(),

  isFeatured: z.boolean(),
});

const EditEvent = () => {
  const { id } = useParams();

  /**
   * Fetch event
   */
  const { data: eventData } = useEvent(id);

  // Hooks for getl all event category
  const {
    data: EventCategoryData,
    isFetching: EventCategoryFetching,
    error: EventCategoryFetchingError,
  } = useEventCategory({});

  /**
   * Update mutation
   */
  const { mutateAsync: updateEventMut, isPending: updatingEvent } =
    useUpdateEvent();

  /**
   * Form
   */
  const {
    control,
    handleSubmit,
    reset,

    setValue,

    watch,

    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      title: "",
      description: "",

      categoryId: "",

      startDateTime: "",
      endDateTime: "",

      locationType: "PHYSICAL",

      location: "",
      meetingUrl: "",

      maxCapacity: undefined,

      externalUrl: "",

      isFeatured: false,
    },
  });

  /**
   * Watch
   */
  const locationType = watch("locationType");

  const isFeatured = watch("isFeatured");

  /**
   * Reset form
   */
  useEffect(() => {
    if (eventData) {
      reset({
        title: eventData.title || "",

        description: eventData.description || "",

        categoryId: eventData.categoryId || "",

        startDateTime: eventData.startDateTime?.slice(0, 16) || "",

        endDateTime: eventData.endDateTime?.slice(0, 16) || "",

        locationType: eventData.locationType || "PHYSICAL",

        location: eventData.location || "",

        meetingUrl: eventData.meetingUrl || "",

        maxCapacity: eventData.maxCapacity || undefined,

        externalUrl: eventData.externalUrl || "",

        isFeatured: eventData.isFeatured ?? false,
      });
    }
  }, [eventData, reset]);

  /**
   * Submit
   */
  const onSubmit = async (data) => {
    try {
      await updateEventMut({
        id,

        data: {
          ...data,

          endDateTime: data.endDateTime || undefined,

          meetingUrl: data.meetingUrl || undefined,

          externalUrl: data.externalUrl || undefined,

          location: data.location || undefined,

          maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : undefined,
        },
      });

      toast.success("Event updated successfully");
    } catch (error) {
      let message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update event";

      if (Array.isArray(message)) message = message.join(", ");

      toast.error(message);
    }
  };

  return (
    <section className={styles.page}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h4" className={styles.title}>
          Edit Event
        </Typography>

        {/* The roster is one click from the event, so staff arriving
                    from the calendar can go straight to who signed up. */}
        <Button
          component={Link}
          to={`/events/${id}/registrations`}
          variant="outlined"
          startIcon={<GroupsIcon />}
        >
          Registrants
        </Button>
      </Box>

      <Paper className={styles.formContainer}>
        <Box
          component="form"

          onSubmit={handleSubmit(onSubmit)}

          className={styles.form}
        >
          {/* TITLE */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          {/* DESCRIPTION */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                multiline
                minRows={5}
                fullWidth
              />
            )}
          />

          {/* CATEGORY */}
          <Controller
            name="categoryId"
            control={control}
            render={() => (
              <CategorySelect
                categorys={EventCategoryData?.data}
                value={watch("categoryId")}
                placeholder="Select Category"
                hideAllCategoryOption={true}
                onChange={(categoryId) =>
                  setValue("categoryId", categoryId, {
                    shouldValidate: true,
                  })
                }
                error={!!errors.categoryId}
              />
            )}
          />

          {/* START DATE */}
          <Controller
            name="startDateTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Start Date & Time"
                type="datetime-local"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                error={!!errors.startDateTime}
                helperText={errors.startDateTime?.message}
              />
            )}
          />

          {/* END DATE */}
          <Controller
            name="endDateTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="End Date & Time"
                type="datetime-local"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
          />

          {/* LOCATION TYPE */}
          <Controller
            name="locationType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Location Type</InputLabel>

                <Select {...field} label="Location Type">
                  {LOCATION_TYPES.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          {/* LOCATION */}
          {locationType === "PHYSICAL" && (
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Location" fullWidth />
              )}
            />
          )}

          {/* MEETING URL */}
          {locationType === "VIRTUAL" && (
            <Controller
              name="meetingUrl"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Meeting URL" fullWidth />
              )}
            />
          )}

          {/* CAPACITY */}
          <Controller
            name="maxCapacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Max Capacity"
                type="number"
                fullWidth
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              />
            )}
          />

          {/* EXTERNAL URL */}
          <Controller
            name="externalUrl"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="External URL" fullWidth />
            )}
          />

          {/* FEATURED */}
          <TextField
            select
            label="Featured Status"
            fullWidth
            value={isFeatured ? "true" : "false"}
            onChange={(e) => setValue("isFeatured", e.target.value === "true")}
          >
            {FEATURED_OPTIONS.map((item) => (
              <MenuItem key={item.label} value={item.value.toString()}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            disabled={updatingEvent}
            className={styles.submitButton}
          >
            {updatingEvent ? "Updating..." : "Update Event"}
          </Button>
        </Box>
      </Paper>
    </section>
  );
};

export default EditEvent;
