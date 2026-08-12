import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  discardContentDrafts,
  getContentKeys,
  getContentRevisions,
  publishContent,
  revertContentKey,
  saveContentDraft,
} from "@/api/content.api";

const KEYS_QUERY = ["content-keys"];

/**
 * Every editable key with its shipped default and any draft/published edit.
 */
export function useContentKeys() {
  return useQuery({
    queryKey: KEYS_QUERY,
    queryFn: () => getContentKeys(),
  });
}

/**
 * Save one field's draft.
 *
 * Deliberately does NOT invalidate the key list: the editor holds the text the
 * person is typing, and refetching mid-edit would fight their cursor. The list
 * is refreshed on publish, revert and discard, which are the moments the
 * server actually becomes the better source.
 */
export function useSaveContentDraft() {
  return useMutation({
    mutationFn: saveContentDraft,
  });
}

export function useRevertContentKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revertContentKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS_QUERY }),
  });
}

export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS_QUERY });
      queryClient.invalidateQueries({ queryKey: ["content-revisions"] });
    },
  });
}

export function useDiscardContentDrafts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discardContentDrafts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS_QUERY }),
  });
}

export function useContentRevisions(params = {}) {
  return useQuery({
    queryKey: ["content-revisions", params],
    queryFn: () => getContentRevisions(params),
  });
}
