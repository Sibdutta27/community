import { api } from "./client";

/**
 * Website Studio media library.
 *
 * Image bytes never pass through this API client: the browser asks for a
 * presigned URL, PUTs the file straight to the public bucket, then tells the
 * API where it landed. That keeps a 4 MB upload off the API's request path
 * entirely and mirrors how enrollment documents are uploaded.
 */

/**
 * Whether uploads are possible at all.
 *
 * Asked before showing a file picker: `S3_PUBLIC_BUCKET` / `S3_PUBLIC_URL` are
 * unset in every environment today, and offering an upload that cannot succeed
 * is worse than saying so.
 */
export async function getMediaStatus() {
  const response = await api.get("/admin/content/media/status");

  return response.data;
}

export async function getMediaLibrary() {
  const response = await api.get("/admin/content/media");

  return response.data;
}

export async function getMediaSlots() {
  const response = await api.get("/admin/content/slots");

  return response.data;
}

/**
 * Step 1 — ask for a presigned PUT. The server validates type and size here,
 * and again on confirm.
 */
export async function presignMediaUpload({ fileName, mimeType, fileSize }) {
  const response = await api.post("/admin/content/media/presign", {
    fileName,
    mimeType,
    fileSize,
  });

  return response.data;
}

/**
 * Step 2 — the bytes are in the bucket; record the image.
 */
export async function confirmMediaUpload(payload) {
  const response = await api.post("/admin/content/media/confirm", payload);

  return response.data;
}

export async function updateMediaAltText({ id, altEn, altEs }) {
  const response = await api.patch(`/admin/content/media/${id}`, {
    altEn,
    altEs,
  });

  return response.data;
}

export async function assignMediaSlot({ slotKey, mediaId }) {
  const response = await api.put(
    `/admin/content/slots/${encodeURIComponent(slotKey)}`,
    { mediaId },
  );

  return response.data;
}

/**
 * Drop the assignment — the slot goes back to the image that ships with the
 * site.
 */
export async function clearMediaSlot(slotKey) {
  const response = await api.delete(
    `/admin/content/slots/${encodeURIComponent(slotKey)}`,
  );

  return response.data;
}

/**
 * Upload one file, end to end.
 *
 * The PUT goes to storage directly with `fetch`, not the axios client: the
 * signed URL is not this API, and the axios interceptor would attach an
 * `Authorization` header that S3 rejects as an unsigned extra header.
 */
export async function uploadMediaFile(file, { altEn, altEs } = {}) {
  const presigned = await presignMediaUpload({
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  const uploaded = await fetch(presigned.uploadUrl, {
    method: "PUT",
    body: file,
    headers: presigned.headers,
  });

  if (!uploaded.ok) {
    throw new Error(
      `The image could not be sent to storage (${uploaded.status}).`,
    );
  }

  return confirmMediaUpload({
    key: presigned.key,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    altEn,
    altEs,
  });
}
