import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/vault-hq-88";
const TOKEN_COOKIE = "zd_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept requests to the hidden admin area
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;

    // No token → redirect to home page (not a login page that leaks the route)
    if (!token || token.trim() === "") {
      const homeUrl = new URL("/", request.url);
      // Add a param so the home page can optionally show a subtle message
      homeUrl.searchParams.set("ref", "restricted");
      return NextResponse.redirect(homeUrl);
    }

    // Token exists — allow the request through
    // Note: full JWT signature verification requires a secret and runs in the API.
    // The middleware acts as a client-side guard; the API validates authenticity.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Match all sub-routes of the protected area
  matcher: ["/vault-hq-88", "/vault-hq-88/:path*"],
};
