import { type NextRequest } from "next/server";
import {
  getMonthBookedSlots,
  getFullyBookedDates,
  getTimeSlotsForDate,
} from "@/lib/bookings";

// Force dynamic — booking data changes on every request.
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings?year=2026&month=7
 *
 * Returns booked slots and fully-booked dates for the requested month.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-indexed

  if (!year || !month || month < 1 || month > 12) {
    return Response.json(
      { error: "Provide valid `year` and `month` query params." },
      { status: 400 }
    );
  }

  // Build date range for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const [bookedSlots, fullyBookedDates] = await Promise.all([
    getMonthBookedSlots(year, month),
    getFullyBookedDates(startDate, endDate),
  ]);

  // Also include total available slots per day for context
  const slotCounts: Record<string, number> = {};
  for (const dateStr of Object.keys(bookedSlots)) {
    slotCounts[dateStr] = getTimeSlotsForDate(dateStr).length;
  }

  return Response.json({ bookedSlots, fullyBookedDates, slotCounts });
}

