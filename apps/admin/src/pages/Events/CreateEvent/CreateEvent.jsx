// pages/Events/CreateEvent/CreateEvent.jsx

import { useForm } from "react-hook-form";

import { Link, useSearchParams } from "react-router-dom";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useMutation } from "@tanstack/react-query";

import { toast } from "react-toastify";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { createEvent } from "@/api/event.api";

import { useEventCategory } from "./hook";

import CategorySelect from "../components/CategorySelect/CategorySelect";

import styles from "./createEvent.module.css";

/**
 * Location type options
 */
const LOCATION_OPTIONS = [
  {
    label: "Physical",
    value: "PHYSICAL",
  },

  {
    label: "Virtual",
    value: "VIRTUAL",
  },
];

/**
 * Featured options
 */
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
const createEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),

  description: z.string().optional(),

  categoryId: z.string().min(1, "Category is required"),

  startDateTime: z.string().min(1, "Start date is required"),

  endDateTime: z.string().optional(),

  locationType: z.enum(["PHYSICAL", "VIRTUAL"]),

  location: z.string().optional(),

  meetingUrl: z.string().optional(),

  maxCapacity: z.coerce.number().optional(),

  isFeatured: z.boolean(),

  externalUrl: z.string().optional(),
});

/**
 * Turn a `?date=YYYY-MM-DD` from the calendar into the value a
 * `datetime-local` input wants. Clicking the 12th should open the form on the
 * 12th; the hour is left at a plain 18:00 evening default rather than
 * midnight, which is never when anything actually happens.
 */
function startFromDateParam(dateParam) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam || "")) {
    return "";
  }

  return `${dateParam}T18:00`;
}

const CreateEvent = () => {
  /**
   * The calendar links here with the day it was clicked on.
   */
  const [searchParams] = useSearchParams();

  const presetStart = startFromDateParam(searchParams.get("date"));

  // Hooks for getl all event category
  const {
    data: EventCategoryData,
    isFetching: EventCategoryFetching,
    error: EventCategoryFetchingError,
  } = useEventCategory({});

  /**
   * Form
   */
  const {
    register,
    handleSubmit,

    formState: { errors },

    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createEventSchema),

    defaultValues: {
      title: "",
      description: "",

      categoryId: "",

      startDateTime: presetStart,
      endDateTime: "",

      locationType: "PHYSICAL",

      location: "",
      meetingUrl: "",

      maxCapacity: 0,

      isFeatured: false,

      externalUrl: "",
    },
  });

  /**
   * Watch values
   */
  const featuredValue = watch("isFeatured");

  const locationType = watch("locationType");

  /**
   * Mutation
   */
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createEvent,
  });

  /**
   * Submit
   */
  const onSubmit = async (data) => {
    try {
      await mutateAsync({
        ...data,

        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
      });

      toast.success("Event created successfully.");

      reset();
    } catch (error) {
      let message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create event";

      if (Array.isArray(message)) message = message.join(", ");

      toast.error(message);
    }
  };

  return (
    <section className={styles.page}>
      <Button
        component={Link}
        to="/events"
        startIcon={<ArrowBackIcon />}
        sx={{
          alignSelf: "flex-start",
          color: "text.secondary",
        }}
      >
        Back to events
      </Button>

      <Typography variant="h4" className={styles.title}>
        Create Event
      </Typography>

      <Paper className={styles.formContainer}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          {/* TITLE */}
          <TextField
            label="Event Title"
            fullWidth
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            multiline
            minRows={4}
            fullWidth
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          {/* CATEGORY */}
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

          {/* START DATE */}
          <TextField
            type="datetime-local"
            label="Start Date & Time"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("startDateTime")}
            error={!!errors.startDateTime}
            helperText={errors.startDateTime?.message}
          />

          {/* END DATE */}
          <TextField
            type="datetime-local"

            label="End Date & Time"

            fullWidth

            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}

            {...register("endDateTime")}
          />

          {/* LOCATION TYPE */}
          <TextField
            select

            label="Location Type"

            fullWidth

            defaultValue="PHYSICAL"

            {...register("locationType")}

            error={!!errors.locationType}

            helperText={errors.locationType?.message}
          >
            {LOCATION_OPTIONS.map((item) => (
              <MenuItem
                key={item.value}

                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          {/* LOCATION */}
          {locationType === "PHYSICAL" && (
            <TextField
              label="Location"

              placeholder="Community Hall"

              fullWidth

              {...register("location")}
            />
          )}

          {/* MEETING URL */}
          {locationType === "VIRTUAL" && (
            <TextField
              label="Meeting URL"

              placeholder="https://zoom.us/..."

              fullWidth

              {...register("meetingUrl")}
            />
          )}

          {/* MAX CAPACITY */}
          <TextField
            label="Maximum Capacity"

            type="number"

            fullWidth

            {...register("maxCapacity")}

            error={!!errors.maxCapacity}

            helperText={errors.maxCapacity?.message}
          />

          {/* FEATURED */}
          <TextField
            select

            label="Featured"

            fullWidth

            value={featuredValue ? "true" : "false"}

            onChange={(e) => setValue("isFeatured", e.target.value === "true")}
          >
            {FEATURED_OPTIONS.map((item) => (
              <MenuItem
                key={item.label}

                value={item.value.toString()}
              >
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          {/* EXTERNAL URL */}
          <TextField
            label="External URL"

            placeholder="https://example.com"

            fullWidth

            {...register("externalUrl")}
          />

          <Button
            type="submit"

            variant="contained"

            disabled={isPending}

            className={styles.submitButton}
          >
            {isPending ? "Creating..." : "Create Event"}
          </Button>
        </Box>
      </Paper>
    </section>
  );
};

export default CreateEvent;
