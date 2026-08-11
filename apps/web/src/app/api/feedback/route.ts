import { AxiosHeaders } from "axios";
import { NextResponse } from "next/server";

import { getBackendAuthHeaders } from "@/app/api/_shared/backend-auth";
import { env } from "@/config/env";
import {
  FEEDBACK_ATTACHMENT_MAX_SIZE,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  isAllowedFeedbackAttachmentType,
} from "@/features/feedback/lib/feedback-config";
import { endpoints } from "@/services/http/apis";
import type { FeedbackSubmitResponse } from "@/features/feedback/lib/feedback-types";

const invalidPayloadMessage = "A valid feedback payload is required.";
const submitFallbackMessage = "Unable to send your feedback right now.";

/**
 * Read the bearer token out of the shared axios headers helper, if the visitor
 * happens to be signed in. Unlike the document routes, a missing session is
 * NOT an error here — the widget is reachable from the public pages, so an
 * anonymous report is forwarded without an Authorization header.
 */
function resolveOptionalAuthorizationHeader(
  headers: Awaited<ReturnType<typeof getBackendAuthHeaders>>,
) {
  if (!headers) {
    return null;
  }

  if (headers instanceof AxiosHeaders) {
    const headerValue = headers.get("Authorization");

    return typeof headerValue === "string" ? headerValue : null;
  }

  const resolvedHeader = headers["authorization"] ?? headers["Authorization"];

  return typeof resolvedHeader === "string" ? resolvedHeader : null;
}

function readTrimmedField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { message: invalidPayloadMessage },
      { status: 400 },
    );
  }

  const message = readTrimmedField(formData, "message");
  const pageUrl = readTrimmedField(formData, "pageUrl");
  const locale = readTrimmedField(formData, "locale");

  if (!message) {
    return NextResponse.json(
      { message: "Please tell us what you are seeing." },
      { status: 400 },
    );
  }

  if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    return NextResponse.json(
      { message: "That message is too long to send." },
      { status: 400 },
    );
  }

  if (!pageUrl || !locale) {
    return NextResponse.json(
      { message: invalidPayloadMessage },
      { status: 400 },
    );
  }

  const backendPayload = new FormData();
  backendPayload.set("message", message);
  backendPayload.set("pageUrl", pageUrl);
  backendPayload.set("locale", locale);

  // The API only ever sees this server's own agent, so forward the browser's.
  const userAgent = request.headers.get("user-agent");

  if (userAgent) {
    backendPayload.set("userAgent", userAgent.slice(0, 512));
  }

  const attachment = formData.get("attachment");

  if (attachment instanceof File && attachment.size > 0) {
    if (!isAllowedFeedbackAttachmentType(attachment.type)) {
      return NextResponse.json(
        { message: "That file type cannot be attached." },
        { status: 400 },
      );
    }

    if (attachment.size > FEEDBACK_ATTACHMENT_MAX_SIZE) {
      return NextResponse.json(
        { message: "That file is too large to attach." },
        { status: 400 },
      );
    }

    backendPayload.set(
      "attachment",
      attachment,
      attachment.name || "attachment",
    );
  }

  const authorizationHeader = resolveOptionalAuthorizationHeader(
    await getBackendAuthHeaders(),
  );

  const backendUrl = new URL(
    endpoints.FEEDBACK.SUBMIT,
    env.apiBaseUrl,
  ).toString();

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      // Multipart: let the runtime write the boundary; never set Content-Type.
      headers: authorizationHeader
        ? { Authorization: authorizationHeader }
        : undefined,
      body: backendPayload,
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | (FeedbackSubmitResponse & {
          message?: string;
          errors?: Record<string, string[]>;
        })
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message ?? submitFallbackMessage,
          errors: data?.errors,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: submitFallbackMessage },
      { status: 500 },
    );
  }
}
