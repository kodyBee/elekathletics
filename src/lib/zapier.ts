import type { Booking } from "./bookings";

/**
 * Fires a webhook to Zapier with the new booking data.
 * Non-blocking (fire-and-forget) — the booking response is returned to the
 * client immediately regardless of whether Zapier receives the event.
 *
 * Set ZAPIER_WEBHOOK_URL in .env.local to enable.
 */
export async function sendBookingWebhook(booking: Booking): Promise<void> {
  const url = process.env.ZAPIER_WEBHOOK_URL;

  if (!url) {
    // No webhook configured — silently skip.
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "booking.created",
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
    // Log but don't throw — webhook failure shouldn't break the booking flow.
    console.error("[Zapier webhook] Failed to send:", err);
  }
}
