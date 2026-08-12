import { NextResponse, type NextRequest } from "next/server";

import {
  isLocale,
  PREVIEW_LOCALE_HEADER,
  PREVIEW_LOCALE_PARAM,
} from "@/i18n/config";
import {
  AUTH_COOKIE_NAME,
  DEFAULT_POST_LOGIN_PATH,
  getTokenMaxAge,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/lib/auth";

// `/yucayeke` (incl. the map, which now lives there) is public.
const protectedPaths = ["/dashboard", "/my-profile"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isAuthPath(pathname: string) {
  return [SIGN_IN_PATH, SIGN_UP_PATH].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Forward the Website Studio preview's requested language as a request header.
 *
 * The Studio shows this site in an iframe, where `community_locale` is a
 * third-party cookie the browser will not send — so a preview would always
 * render English. A header set here reaches `i18n/request.ts`, which honours
 * it only for known locales. Nothing is persisted: the visitor's own cookie is
 * untouched, so previewing Spanish cannot change anyone's language.
 */
function withPreviewLocale(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get(PREVIEW_LOCALE_PARAM);

  if (!isLocale(requested)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PREVIEW_LOCALE_HEADER, requested);

  return NextResponse.next({ request: { headers: requestHeaders } });
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

  // Public pages: middleware runs here ONLY for the Studio preview. Returning
  // early keeps their behaviour byte-for-byte what it was before the matcher
  // widened — in particular, no stale-cookie clearing that did not happen
  // before.
  if (!isProtectedPath(pathname) && !isAuthPath(pathname)) {
    return withPreviewLocale(request);
  }

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

  if (isAuthenticated && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL(DEFAULT_POST_LOGIN_PATH, request.url));
  }

  return withStaleCookieCleared(NextResponse.next());
}

export const config = {
  // Widened from the four guarded routes so the Studio preview's `?lang` is
  // seen on any page. Static assets, images and API routes are excluded —
  // they have no locale and no reason to pay for a middleware hop.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|geo|admin).*)",
  ],
};
