import { type NextRequest } from "next/server";
import { isSlotAvailable, getTimeSlotsForDate } from "@/lib/bookings";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/availability?date=2026-07-10&time=09:00
 *
 * Quick check whether a specific date+time slot is open.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!date || !time) {
    return Response.json(
      { error: "Provide `date` and `time` query params." },
      { status: 400 }
    );
  }

  // Check if the time is valid for this day
  const validSlots = getTimeSlotsForDate(date);
  if (!validSlots.includes(time)) {
    return Response.json({ available: false, reason: "closed" });
  }

  const available = await isSlotAvailable(date, time);
  return Response.json({ available });
}
