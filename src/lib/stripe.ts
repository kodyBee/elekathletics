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
