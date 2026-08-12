import { api } from "./client";

/**
 * Website Studio content.
 *
 * The key list is deliberately unpaginated — 368 editable keys is one payload,
 * and the editor filters client-side. Paginating would turn "show me every
 * unpublished change" into a multi-request problem for no benefit.
 */
export async function getContentKeys(params = {}) {
  const response = await api.get("/admin/content/keys", {
    params: {
      namespace: params.namespace || undefined,
    },
  });

  return response.data;
}

/**
 * Save a draft edit for one key. Does not touch the live site.
 */
export async function saveContentDraft({ keyPath, en, es }) {
  const response = await api.put(
    `/admin/content/strings/${encodeURIComponent(keyPath)}`,
    { en, es },
  );

  return response.data;
}

/**
 * Drop the override entirely — the key returns to its shipped default.
 */
export async function revertContentKey(keyPath) {
  const response = await api.delete(
    `/admin/content/strings/${encodeURIComponent(keyPath)}`,
  );

  return response.data;
}

/**
 * Publish every pending draft at once.
 */
export async function publishContent() {
  const response = await api.post("/admin/content/publish");

  return response.data;
}

export async function discardContentDrafts() {
  const response = await api.post("/admin/content/discard");

  return response.data;
}

export async function getContentRevisions(params = {}) {
  const response = await api.get("/admin/content/revisions", {
    params: {
      page: params.page,
      limit: params.limit,
    },
  });

  return response.data;
}
