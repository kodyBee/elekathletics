import { type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { confirmBooking, getBookingById } from "@/lib/bookings";
import { sendBookingWebhook } from "@/lib/zapier";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. The primary event we care about is
 * `checkout.session.completed` — this confirms the booking and fires
 * the Zapier webhook so Trainerize gets notified.
 *
 * IMPORTANT: Read the raw body as text for signature verification.
 * Do NOT use request.json() — it breaks the signature check.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return new Response("Invalid signature.", { status: 400 });
  }

  // ── Handle events ─────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.warn("[Stripe Webhook] No bookingId in session metadata.");
        break;
      }

      // Confirm the booking
      const confirmed = await confirmBooking(bookingId, session.id);

      if (confirmed) {
        console.log(`[Stripe Webhook] Booking ${bookingId} confirmed.`);

        // Fire Zapier (Trainerize) for paid bookings only
        const booking = await getBookingById(bookingId);
        if (booking) {
          sendBookingWebhook(booking).catch(() => {});
        }
      } else {
        console.warn(
          `[Stripe Webhook] Could not find booking ${bookingId} to confirm.`
        );
      }
      break;
    }

    default:
      // We don't handle other event types — just acknowledge them.
      break;
  }

  return new Response("OK", { status: 200 });
}
