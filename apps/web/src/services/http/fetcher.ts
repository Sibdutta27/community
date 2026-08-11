type ApiMessageResponse = {
  message?: string;
};

type RequestJsonOptions<TBody> = Omit<RequestInit, "body"> & {
  body?: TBody;
  fallbackMessage: string;
  /**
   * When the backend rejects the session with a 401, clear the stale cookie
   * and redirect to sign-in. Defaults to `true`; set `false` for endpoints
   * where a 401 is an expected outcome (e.g. a failed login attempt).
   */
  redirectOnUnauthorized?: boolean;
};

type RequestMultipartOptions = Omit<RequestInit, "body"> & {
  body: FormData;
  fallbackMessage: string;
  redirectOnUnauthorized?: boolean;
};

let unauthorizedRedirectInFlight = false;
let consentRedirectInFlight = false;

/** The single consent surface — the enrollment introduction, before step 1. */
const CONSENT_SCREEN_PATH = "/enrollment/start";

/**
 * `ConsentAcceptedGuard` rejects every enrollment/document write with exactly
 * this message when the enrollment has no consent on record.
 */
const CONSENT_NOT_ACCEPTED_MESSAGE = "consent not accepted";

/**
 * Consent is asked once, before step 1 — but a NEW required consent can be
 * published while a member is mid-flow, at which point the backend starts
 * 403ing their saves. Rather than surface a dead-end error, send them back to
 * the consent screen; it shows only what is still pending and returns them to
 * the flow. Deliberately narrow: only this guard's message redirects, so an
 * unrelated 403 still bubbles up as an error.
 */
function handleConsentNotAccepted() {
  if (typeof window === "undefined" || consentRedirectInFlight) {
    return;
  }

  if (window.location.pathname === CONSENT_SCREEN_PATH) {
    return;
  }

  consentRedirectInFlight = true;
  window.location.assign(CONSENT_SCREEN_PATH);
}

function isConsentNotAcceptedResponse(status: number, message?: string) {
  return (
    status === 403 &&
    message?.trim().toLowerCase() === CONSENT_NOT_ACCEPTED_MESSAGE
  );
}

/**
 * A 401 from an authenticated endpoint means the session is no longer valid
 * (expired or orphaned token). The auth cookie is httpOnly, so it can only be
 * cleared server-side — hit the logout route, then send the user to sign-in
 * with a `next` param so they land back where they were after re-auth.
 */
async function handleUnauthorized() {
  if (typeof window === "undefined" || unauthorizedRedirectInFlight) {
    return;
  }

  // Already on the sign-in page (e.g. a background query firing there) — the
  // middleware handles the cookie; don't loop the navigation.
  if (window.location.pathname === "/sign-in") {
    return;
  }

  unauthorizedRedirectInFlight = true;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Redirect regardless — the middleware also clears an expired cookie.
  }

  const current = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/sign-in?next=${encodeURIComponent(current)}`);
}

export async function requestJson<TResponse, TBody = undefined>(
  input: RequestInfo | URL,
  {
    body,
    fallbackMessage,
    headers,
    redirectOnUnauthorized = true,
    ...init
  }: RequestJsonOptions<TBody>,
) {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(input, {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: requestHeaders,
    });

    const data = (await response.json().catch(() => null)) as
      (TResponse & ApiMessageResponse) | null;

    if (!response.ok) {
      if (response.status === 401 && redirectOnUnauthorized) {
        void handleUnauthorized();
      }

      if (isConsentNotAcceptedResponse(response.status, data?.message)) {
        handleConsentNotAccepted();
      }

      throw new Error(data?.message ?? fallbackMessage);
    }

    return (data ?? {}) as TResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
}

export async function requestMultipart<TResponse>(
  input: RequestInfo | URL,
  {
    body,
    fallbackMessage,
    headers,
    redirectOnUnauthorized = true,
    ...init
  }: RequestMultipartOptions,
) {
  const requestHeaders = new Headers(headers);

  // Let the browser/runtime attach multipart boundary automatically.
  requestHeaders.delete("Content-Type");

  try {
    const response = await fetch(input, {
      ...init,
      body,
      headers: requestHeaders,
    });

    const data = (await response.json().catch(() => null)) as
      (TResponse & ApiMessageResponse) | null;

    if (!response.ok) {
      if (response.status === 401 && redirectOnUnauthorized) {
        void handleUnauthorized();
      }

      if (isConsentNotAcceptedResponse(response.status, data?.message)) {
        handleConsentNotAccepted();
      }

      throw new Error(data?.message ?? fallbackMessage);
    }

    return (data ?? {}) as TResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
}
