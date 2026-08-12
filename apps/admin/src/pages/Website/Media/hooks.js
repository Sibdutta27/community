import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignMediaSlot,
  clearMediaSlot,
  getMediaLibrary,
  getMediaSlots,
  getMediaStatus,
  updateMediaAltText,
  uploadMediaFile,
} from "@/api/media.api";

const LIBRARY_QUERY = ["content-media"];
const SLOTS_QUERY = ["content-media-slots"];

/**
 * Whether media storage is configured at all.
 *
 * Retries are off: an unconfigured API answers this correctly and instantly,
 * and a failing request here should surface as "we could not check" rather
 * than three seconds of spinner.
 */
export function useMediaStatus() {
  return useQuery({
    queryKey: ["content-media-status"],
    queryFn: getMediaStatus,
    retry: false,
  });
}

export function useMediaLibrary() {
  return useQuery({
    queryKey: LIBRARY_QUERY,
    queryFn: getMediaLibrary,
  });
}

/**
 * Every slot the site renders, assigned or not — the list comes from the
 * registry, so an untouched slot still appears with its shipped default.
 */
export function useMediaSlots() {
  return useQuery({
    queryKey: SLOTS_QUERY,
    queryFn: getMediaSlots,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, altEn, altEs }) =>
      uploadMediaFile(file, { altEn, altEs }),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY }),
  });
}

/**
 * Alt text edits also refresh the slots: the slot cards show the assigned
 * image's description, and leaving them stale is how someone "fixes" the same
 * missing alt text twice.
 */
export function useUpdateMediaAltText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMediaAltText,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY });
      queryClient.invalidateQueries({ queryKey: SLOTS_QUERY });
    },
  });
}

export function useAssignMediaSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignMediaSlot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SLOTS_QUERY }),
  });
}

export function useClearMediaSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearMediaSlot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SLOTS_QUERY }),
  });
}
