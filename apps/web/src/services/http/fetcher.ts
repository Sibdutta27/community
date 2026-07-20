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
