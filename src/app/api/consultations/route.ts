import { type NextRequest } from "next/server";
import { addBooking, confirmBooking, type BookingInput } from "@/lib/bookings";
import { sendConsultationEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Every booking made through the site is a free consultation. */
const CONSULTATION_PACKAGE = "consultation";

/**
 * POST /api/consultations
 *
 * Books a free consultation. Nothing is charged here — Elek sends a payment
 * link from the coach dashboard after the call, so the site never touches
 * Stripe Checkout.
 *
 * Body: { name, email, phone?, date, time, goals? }
 */
export async function POST(request: NextRequest) {
  let body: BookingInput;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, date, time } = body;

  if (!name || !email || !date || !time) {
    return Response.json(
      { error: "Missing required fields: name, email, date, time." },
      { status: 400 }
    );
  }

  // The package is set here rather than taken from the request — a client can
  // only ever book the consultation, whatever the body claims.
  const result = await addBooking({
    name: String(name).trim(),
    email: String(email).trim(),
    phone: body.phone ? String(body.phone).trim() : undefined,
    date: String(date),
    time: String(time),
    package: CONSULTATION_PACKAGE,
    goals: body.goals ? String(body.goals).trim() : undefined,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const booking = result.booking;

  // No payment window to wait on, so the slot is claimed permanently now.
  await confirmBooking(booking.id, "free_consultation");

  // Awaited, not fire-and-forget: this runs on a serverless function that can
  // be frozen the moment the response is sent, which would abandon the
  // in-flight Resend requests. With payments gone this email is the only
  // confirmation a client gets, so a failure must at least reach the logs.
  await sendConsultationEmails(booking).catch((err) =>
    console.error("[Consultations] confirmation emails failed:", err)
  );

  return Response.json({ bookingId: booking.id }, { status: 201 });
}
