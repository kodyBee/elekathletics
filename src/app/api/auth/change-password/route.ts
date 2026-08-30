import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  changePassword,
  createSession,
  destroyAllSessions,
  getSession,
  verifyPassword,
} from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await getSession(sessionId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // `verifyPassword`, not `verifyLogin` — the dev password must not be able
    // to stand in for the real current one.
    if (!(await verifyPassword(currentPassword))) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    if (await verifyPassword(newPassword)) {
      return NextResponse.json(
        { error: "New password must be different from the current one" },
        { status: 400 }
      );
    }

    await changePassword(newPassword);

    // Changing the password ends every existing session — including any the
    // old forgeable-cookie scheme handed out — then this browser gets a fresh
    // one so the user is not bounced back to the login screen.
    await destroyAllSessions();
    const rotated = await createSession(false);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: rotated,
      httpOnly: true,
      path: "/",
      maxAge: THIRTY_DAYS,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
