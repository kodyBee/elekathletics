import type { Booking } from "./bookings";

/**
 * Fires a webhook to Zapier with a paid-booking event.
 * Use this for plans that should create a Trainerize client.
 *
 * Set ZAPIER_WEBHOOK_URL in .env.local to enable.
 */
export async function sendBookingWebhook(booking: Booking): Promise<void> {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) return;
  await postBooking(url, "booking.created", booking, "[Zapier booking]");
}

/**
 * Fires a webhook to Zapier with a free-consultation event.
 * Use this for free consults that should ONLY add a calendar event
 * (no Trainerize client — Trainerize charges per client).
 *
 * Set ZAPIER_CONSULTATION_WEBHOOK_URL in .env.local to enable.
 */
export async function sendConsultationWebhook(
  booking: Booking
): Promise<void> {
  const url = process.env.ZAPIER_CONSULTATION_WEBHOOK_URL;
  if (!url) return;
  await postBooking(
    url,
    "consultation.booked",
    booking,
    "[Zapier consultation]"
  );
}

async function postBooking(
  url: string,
  event: string,
  booking: Booking,
  logTag: string
): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        booking: {
          id: booking.id,
          name: booking.name,
          email: booking.email,
          phone: booking.phone ?? null,
          date: booking.date,
          time: booking.time,
          package: booking.package,
          goals: booking.goals ?? null,
          createdAt: booking.createdAt,
        },
      }),
    });
  } catch (err) {
    console.error(`${logTag} Failed to send:`, err);
  }
}
