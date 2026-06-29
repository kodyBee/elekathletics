import { type NextRequest, NextResponse } from "next/server";
import {
  addInquiry,
  getInquiries,
  type InquiryTopic,
} from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const ALLOWED_TOPICS: InquiryTopic[] = ["general", "in-person", "custom"];

function isCoach(request: NextRequest): boolean {
  const cookie = request.cookies.get("coach_auth");
  return cookie?.value === "true";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const subject = String(data.subject ?? "").trim();
  const message = String(data.message ?? "").trim();
  const topicRaw = String(data.topic ?? "general").trim() as InquiryTopic;
  const topic = ALLOWED_TOPICS.includes(topicRaw) ? topicRaw : "general";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const inquiry = await addInquiry({
    name,
    email,
    subject: subject || undefined,
    message,
    topic,
  });

  return NextResponse.json({ ok: true, inquiry });
}

export async function GET(request: NextRequest) {
  if (!isCoach(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = await getInquiries();
  return NextResponse.json({ inquiries });
}
