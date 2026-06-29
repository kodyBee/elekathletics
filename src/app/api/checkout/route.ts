import { type NextRequest } from "next/server";
import { getStripe, PACKAGE_PRICES } from "@/lib/stripe";
import { addBooking, confirmBooking, type BookingInput } from "@/lib/bookings";
import { sendConsultationWebhook } from "@/lib/zapier";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 *
 * Creates a booking (pending_payment) then creates a Stripe Checkout Session.
 * Returns the checkout URL for the client to redirect to.
 *
 * Body: { name, email, phone?, date, time, package, goals? }
 */
export async function POST(request: NextRequest) {
  let body: BookingInput;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, date, time, package: pkg } = body;

  if (!name || !email || !date || !time || !pkg) {
    return Response.json(
      { error: "Missing required fields: name, email, date, time, package." },
      { status: 400 }
    );
  }

  // Validate the package has a Stripe price configured (unless it's the free consultation)
  const isFreeConsultation = pkg === "consultation";
  const priceConfig = PACKAGE_PRICES[pkg];
  if (!isFreeConsultation && (!priceConfig || !priceConfig.priceId)) {
    return Response.json(
      { error: "This package is not yet set up for payments. Please contact us directly." },
      { status: 400 }
    );
  }

  // 1. Create the booking with pending_payment status
  const result = await addBooking({
    name: String(name).trim(),
    email: String(email).trim(),
    phone: body.phone ? String(body.phone).trim() : undefined,
    date: String(date),
    time: String(time),
    package: String(pkg),
    goals: body.goals ? String(body.goals).trim() : undefined,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const booking = result.booking;
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  // Free packages bypass Stripe entirely
  if (isFreeConsultation) {
    await confirmBooking(booking.id, "free_consultation");

    // Fire-and-forget — calendar-only Zap (no Trainerize)
    sendConsultationWebhook(booking).catch(() => {});

    return Response.json(
      {
        successUrl: `${baseUrl}/coaching/success?booking_id=${booking.id}`,
        bookingId: booking.id,
      },
      { status: 201 }
    );
  }

  // 2. Create Stripe Checkout Session
  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: priceConfig.mode,
      customer_email: email,
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        bookingDate: booking.date,
        bookingTime: booking.time,
        bookingPackage: booking.package,
        clientName: booking.name,
      },
      success_url: `${baseUrl}/coaching/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${baseUrl}/coaching/cancel?booking_id=${booking.id}`,
    });

    return Response.json(
      {
        checkoutUrl: session.url,
        bookingId: booking.id,
        sessionId: session.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Stripe] Failed to create checkout session:", err);
    return Response.json(
      { error: "Failed to create payment session. Please try again." },
      { status: 500 }
    );
  }
}
