import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, getSession } from "@/lib/auth";

// Renamed from `middleware` per the Next 16 deprecation. `proxy` runs on the
// nodejs runtime, which is what lets this look the session up in Redis.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/coach/login");
  const isChangePassword = pathname.startsWith("/coach/change-password");

  if (!pathname.startsWith("/coach") || isLogin) {
    return NextResponse.next();
  }

  const session = await getSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/coach/login", request.url));
  }

  if (session.mustChangePassword && !isChangePassword) {
    return NextResponse.redirect(
      new URL("/coach/change-password", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/coach/:path*",
};
