import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, mustChangePassword } from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (await verifyPassword(password)) {
      const needsChange = await mustChangePassword();
      const response = NextResponse.json({
        success: true,
        mustChangePassword: needsChange,
      });
      response.cookies.set({
        name: "coach_auth",
        value: "true",
        httpOnly: true,
        path: "/",
        maxAge: THIRTY_DAYS,
        sameSite: "lax",
      });
      response.cookies.set({
        name: "coach_must_change",
        value: needsChange ? "true" : "",
        httpOnly: true,
        path: "/",
        maxAge: needsChange ? THIRTY_DAYS : 0,
        sameSite: "lax",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
