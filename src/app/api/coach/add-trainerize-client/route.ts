import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get("coach_auth");
  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const url = process.env.ZAPIER_WEBHOOK_URL;
    if (!url) {
      return NextResponse.json({ error: "Zapier webhook URL is not configured" }, { status: 500 });
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "manual.client.created",
        timestamp: new Date().toISOString(),
        booking: {
          name,
          email,
          phone: phone || null,
          package: "custom",
        },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Zapier] Failed to add client:", error);
    return NextResponse.json({ error: "Failed to add client to Trainerize" }, { status: 500 });
  }
}
