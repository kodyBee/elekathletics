import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, changePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get("coach_auth");
  if (!authCookie || authCookie.value !== "true") {
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

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "coach_must_change",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
