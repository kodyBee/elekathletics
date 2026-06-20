import Stripe from "stripe";

/**
 * Lazy Stripe instance. Initialised on first use so the build doesn't
 * crash when STRIPE_SECRET_KEY isn't configured yet.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.local.example for guidance."
      );
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

/**
 * Package → Stripe Price ID mapping.
 *
 * Elek creates Products + Prices in the Stripe Dashboard, then pastes
 * the Price IDs here. Each key matches a `value` from the PACKAGES array
 * in the booking form.
 *
 * Price IDs look like:  price_1abc123...
 *
 * The `mode` field tells Checkout whether this is a one-time payment
 * or a recurring subscription.
 */
export const PACKAGE_PRICES: Record<
  string,
  { priceId: string; mode: "payment" | "subscription" }
> = {
  "online-premium": {
    priceId: process.env.STRIPE_PRICE_ONLINE_PREMIUM ?? "",
    mode: "subscription",
  },
  "in-person-wnrs": {
    priceId: process.env.STRIPE_PRICE_IN_PERSON_WNRS ?? "",
    mode: "payment",
  },
  "in-person-outside": {
    priceId: process.env.STRIPE_PRICE_IN_PERSON_OUTSIDE ?? "",
    mode: "payment",
  },
  nutrition: {
    priceId: process.env.STRIPE_PRICE_NUTRITION ?? "",
    mode: "payment",
  },
  "posing-in-person": {
    priceId: process.env.STRIPE_PRICE_POSING_IN_PERSON ?? "",
    mode: "payment",
  },
  "posing-online": {
    priceId: process.env.STRIPE_PRICE_POSING_ONLINE ?? "",
    mode: "payment",
  },
};
