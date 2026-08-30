import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSession,
  mustChangePassword,
  verifyLogin,
} from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!(await verifyLogin(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const needsChange = await mustChangePassword();
    const sessionId = await createSession(needsChange);

    const response = NextResponse.json({
      success: true,
      mustChangePassword: needsChange,
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionId,
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
