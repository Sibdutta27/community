import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  DEFAULT_POST_LOGIN_PATH,
  getTokenMaxAge,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/lib/auth";

const protectedPaths = ["/dashboard", "/my-profile", "/yucayeke/map"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * The backend rejects expired tokens (1h TTL), so a stale cookie is not a
 * valid session. `getTokenMaxAge` returns 0 once `exp` has passed.
 */
function isTokenExpired(token: string) {
  const maxAge = getTokenMaxAge(token);
  return maxAge !== undefined && maxAge <= 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasExpiredToken = Boolean(token) && isTokenExpired(token as string);
  const isAuthenticated = Boolean(token) && !hasExpiredToken;

  // Delete the stale cookie so a user holding an expired token isn't trapped:
  // without this they'd be treated as "authenticated" and bounced away from
  // /sign-in, unable to obtain a fresh token.
  const withStaleCookieCleared = (response: NextResponse) => {
    if (hasExpiredToken) {
      response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  };

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return withStaleCookieCleared(NextResponse.redirect(signInUrl));
  }

  if (
    isAuthenticated &&
    [SIGN_IN_PATH, SIGN_UP_PATH].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return NextResponse.redirect(new URL(DEFAULT_POST_LOGIN_PATH, request.url));
  }

  return withStaleCookieCleared(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-profile/:path*",
    "/yucayeke/map/:path*",
    "/yucayeke/map",
    "/sign-in",
    "/sign-up",
  ],
};
