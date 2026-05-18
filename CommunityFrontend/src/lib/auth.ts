export const AUTH_COOKIE_NAME = "community_auth_token";
export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";
export const DEFAULT_POST_LOGIN_PATH = "/dashboard";

export type AuthUser = {
  id: string;
  publicId?: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthLoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type AuthRegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthSessionResponse = {
  accessToken: string;
};

export type AuthLoginResponse = AuthSessionResponse;

type JwtPayload = {
  exp?: number;
  sub?: string;
  publicId?: string;
  email?: string;
  role?: string;
  name?: string;
};

type CookieGetter = {
  get(name: string): { value: string } | undefined;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding
    ? `${normalized}${"=".repeat(4 - padding)}`
    : normalized;

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  const nodeBuffer = globalThis.Buffer;

  if (nodeBuffer) {
    return nodeBuffer.from(padded, "base64").toString("utf8");
  }

  throw new Error("Unable to decode token payload.");
}

function decodeJwtPayload<T>(token: string): T | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as T;
  } catch {
    return null;
  }
}

export function getTokenMaxAge(token: string) {
  const payload = decodeJwtPayload<JwtPayload>(token);

  if (!payload?.exp) {
    return undefined;
  }

  const remainingSeconds = payload.exp - Math.floor(Date.now() / 1000);
  return Math.max(remainingSeconds, 0);
}

export function normalizeNamePart(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function appendNextQuery(path: string, next?: string | null) {
  if (!next) {
    return path;
  }

  return `${path}?next=${encodeURIComponent(getSafeRedirectPath(next))}`;
}

export function getUserFromAccessToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload<JwtPayload>(token);

  if (
    !payload?.sub &&
    !payload?.publicId &&
    !payload?.email &&
    !payload?.name
  ) {
    return null;
  }

  return {
    id: payload?.sub ?? "unknown",
    publicId: payload?.publicId?.trim() || undefined,
    name: payload?.name ?? payload?.email ?? "Member",
    email: payload?.email ?? "",
    role: payload?.role ?? "USER",
  };
}

export function getAuthenticatedUser(cookies: CookieGetter) {
  return getUserFromAccessToken(cookies.get(AUTH_COOKIE_NAME)?.value);
}

export function getSafeRedirectPath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return value;
}
