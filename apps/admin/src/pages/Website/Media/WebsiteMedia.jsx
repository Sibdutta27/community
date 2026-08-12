import { useState } from "react";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";

import UploadIcon from "@mui/icons-material/Upload";

import { toast } from "react-toastify";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import { WEBSITE_SECTION_ITEMS } from "../sections";

import MediaCard from "./MediaCard";
import SlotCard from "./SlotCard";

import {
  useAssignMediaSlot,
  useClearMediaSlot,
  useMediaLibrary,
  useMediaSlots,
  useMediaStatus,
  useUpdateMediaAltText,
  useUploadMedia,
} from "./hooks";

/** Mirrors the server-side policy in apps/api/src/modules/content/config.ts. */
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/avif";
const MAX_FILE_SIZE = 4 * 1024 * 1024;

/**
 * The Website Studio's Media tab.
 *
 * Two things: a library of uploaded images, and the list of positions on the
 * site each one can be dropped into. Every position always shows something —
 * assigning is swapping one working image for another, never filling a hole —
 * so "Restore original" is always available and the site keeps working even if
 * this whole surface is unreachable.
 *
 * Files go from the browser straight to storage via a presigned PUT; the API
 * only ever handles the metadata.
 */
export default function WebsiteMedia() {
  const [uploadError, setUploadError] = useState(null);

  const status = useMediaStatus();
  const library = useMediaLibrary();
  const slots = useMediaSlots();

  const upload = useUploadMedia();
  const updateAlt = useUpdateMediaAltText();
  const assign = useAssignMediaSlot();
  const clear = useClearMediaSlot();

  const storageConfigured = status.data?.storageConfigured === true;
  const images = library.data?.data ?? [];
  const slotList = slots.data?.data ?? [];

  const busy =
    upload.isPending ||
    updateAlt.isPending ||
    assign.isPending ||
    clear.isPending;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = "";

    if (!file) return;

    setUploadError(null);

    // Checked here as well as on the server so the person sees the problem
    // before waiting out an upload that was always going to be refused.
    if (file.type === "image/svg+xml") {
      setUploadError(
        "SVG files are not accepted: an SVG can carry script and would run on the public site. " +
          "The site's SVG artwork lives in the code — ask a developer to change one. " +
          "Upload a JPEG, PNG, WebP or AVIF instead.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        "That image is larger than the 4 MB limit. Export it smaller — site images load on every visit.",
      );
      return;
    }

    try {
      await upload.mutateAsync({ file });
      toast.success("Image uploaded");
    } catch (error) {
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          "The image could not be uploaded.",
      );
    }
  };

  const handleAssign = async (input) => {
    try {
      await assign.mutateAsync(input);
      toast.success("The site is now showing that image");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not change that image",
      );
    }
  };

  const handleClear = async (slotKey) => {
    try {
      await clear.mutateAsync(slotKey);
      toast.success("Original image restored");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not restore the original",
      );
    }
  };

  const handleSaveAlt = async (input) => {
    try {
      await updateAlt.mutateAsync(input);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not save the description",
      );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Website Studio"
        description="Swap the pictures on the public site. Every position keeps working — an unassigned one shows the image that ships with the site."
        action={
          <Button
            component="label"
            variant="contained"
            startIcon={
              upload.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <UploadIcon />
              )
            }
            disabled={!storageConfigured || busy}
          >
            {upload.isPending ? "Uploading…" : "Upload image"}
            <input
              type="file"
              hidden
              accept={ACCEPTED_TYPES}
              onChange={handleFile}
            />
          </Button>
        }
      />

      <SectionNav items={WEBSITE_SECTION_ITEMS} />

      {/* The state every environment is in today. Said plainly and once,
          rather than as a failure after someone picks a file. */}
      {status.isSuccess && !storageConfigured ? (
        <Alert severity="info">
          <AlertTitle>Image storage is not set up yet</AlertTitle>
          New images cannot be uploaded until a developer configures a public
          image bucket on the API (<code>S3_PUBLIC_BUCKET</code> and{" "}
          <code>S3_PUBLIC_URL</code>). Until then every position on the site
          shows the picture that ships with it, and the site is unaffected.
        </Alert>
      ) : null}

      {status.isError ? (
        <Alert severity="warning">
          Could not check whether image storage is available.
        </Alert>
      ) : null}

      {uploadError ? (
        <Alert severity="error" onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      ) : null}

      <Panel>
        <Typography variant="subtitle2" fontWeight={700}>
          Where images appear
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", display: "block" }}
        >
          Each position on the public site, and the picture it is showing.
          Changes are live immediately.
        </Typography>

        {slots.isLoading ? (
          <Box sx={{ mt: 1.5 }}>
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} variant="rounded" height={84} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : slots.isError ? (
          <Alert
            severity="error"
            sx={{ mt: 1.5 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => slots.refetch()}
              >
                Retry
              </Button>
            }
          >
            Could not load the site&apos;s image positions.
          </Alert>
        ) : (
          <Box sx={{ mt: 0.5 }}>
            {slotList.map((slot) => (
              <SlotCard
                key={slot.slotKey}
                slot={slot}
                library={images}
                disabled={busy}
                onAssign={handleAssign}
                onClear={handleClear}
              />
            ))}
          </Box>
        )}
      </Panel>

      <Panel>
        <Typography variant="subtitle2" fontWeight={700}>
          Uploaded images
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", display: "block" }}
        >
          JPEG, PNG, WebP or AVIF, up to 4 MB. Describe each one in both
          languages — screen readers and search engines read that text.
        </Typography>

        {library.isLoading ? (
          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {[0, 1, 2, 3].map((n) => (
              <Skeleton key={n} variant="rounded" height={260} />
            ))}
          </Box>
        ) : library.isError ? (
          <Alert
            severity="error"
            sx={{ mt: 1.5 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => library.refetch()}
              >
                Retry
              </Button>
            }
          >
            Could not load the media library.
          </Alert>
        ) : images.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ mt: 3, textAlign: "center", color: "var(--admin-muted)" }}
          >
            {storageConfigured
              ? "No images uploaded yet. Use “Upload image” to add the first one."
              : "No images uploaded yet."}
          </Typography>
        ) : (
          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {images.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                saving={updateAlt.isPending}
                onSaveAlt={handleSaveAlt}
              />
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
}
