import { AxiosHeaders } from "axios";
import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
} from "@/app/api/_shared/backend-auth";
import { env } from "@/config/env";
import { endpoints } from "@/services/http/apis";
import type { EnrollmentDocumentUploadResponse } from "@/types/enrollment";

const invalidPayloadMessage = "A valid multipart document payload is required.";
const uploadFallbackMessage =
  "Unable to upload the selected document right now.";

function resolveAuthorizationHeader(
  headers: Awaited<ReturnType<typeof getBackendAuthHeaders>>,
) {
  if (!headers) {
    return null;
  }

  if (headers instanceof AxiosHeaders) {
    const headerValue = headers.get("Authorization");

    return typeof headerValue === "string" ? headerValue : null;
  }

  const lowerCaseHeader = headers["authorization"];
  const upperCaseHeader = headers["Authorization"];
  const resolvedHeader = lowerCaseHeader ?? upperCaseHeader;

  return typeof resolvedHeader === "string" ? resolvedHeader : null;
}

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { message: invalidPayloadMessage },
      { status: 400 },
    );
  }

  const documentTypeValue = formData.get("documentType");
  const fileValue = formData.get("file");

  if (typeof documentTypeValue !== "string" || !documentTypeValue.trim()) {
    return NextResponse.json(
      { message: "The document type is required." },
      { status: 400 },
    );
  }

  if (!(fileValue instanceof File) || fileValue.size <= 0) {
    return NextResponse.json(
      { message: "A non-empty file is required for upload." },
      { status: 400 },
    );
  }

  const authorizationHeader = resolveAuthorizationHeader(authHeaders);

  if (!authorizationHeader) {
    return createUnauthorizedResponse();
  }

  const backendPayload = new FormData();
  backendPayload.set("documentType", documentTypeValue.trim());
  backendPayload.set("file", fileValue, fileValue.name || "document");
  const backendUploadUrl = new URL(
    endpoints.DOCUMENT.UPLOAD,
    env.apiBaseUrl,
  ).toString();

  try {
    const response = await fetch(backendUploadUrl, {
      method: "POST",
      headers: {
        Authorization: authorizationHeader,
      },
      body: backendPayload,
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | (EnrollmentDocumentUploadResponse & {
          message?: string;
          errors?: Record<string, string[]>;
        })
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message ?? uploadFallbackMessage,
          errors: data?.errors,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: uploadFallbackMessage },
      { status: 500 },
    );
  }
}
