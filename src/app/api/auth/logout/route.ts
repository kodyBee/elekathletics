import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Drop the server-side record too, so the id is dead even if the cookie
  // was captured before it was cleared.
  await destroySession(request.cookies.get(SESSION_COOKIE)?.value);

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Clear the cookies the previous scheme used, so a stale "true" left in a
  // browser doesn't linger.
  for (const stale of ["coach_auth", "coach_must_change"]) {
    response.cookies.set({ name: stale, value: "", path: "/", maxAge: 0 });
  }

  return response;
}
