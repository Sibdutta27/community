import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  DEFAULT_POST_LOGIN_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/lib/auth";

const protectedPaths = ["/dashboard", "/my-profile"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (
    isAuthenticated &&
    [SIGN_IN_PATH, SIGN_UP_PATH].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return NextResponse.redirect(new URL(DEFAULT_POST_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-profile/:path*", "/sign-in", "/sign-up"],
};
