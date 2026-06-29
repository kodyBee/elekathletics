import { type NextRequest, NextResponse } from "next/server";
import {
  deleteInquiry,
  updateInquiryStatus,
  type InquiryStatus,
} from "@/lib/inquiries";

export const dynamic = "force-dynamic";

function isCoach(request: NextRequest): boolean {
  const cookie = request.cookies.get("coach_auth");
  return cookie?.value === "true";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCoach(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: InquiryStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.status !== "new" && body.status !== "resolved") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updateInquiryStatus(id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, inquiry: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCoach(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deleteInquiry(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
