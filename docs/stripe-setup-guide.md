# Stripe Setup Guide — Elek Athletics

This guide walks you through setting up Stripe to accept payments on elekathletics.com.

---

## Step 1: Create Your Stripe Account

1. Go to [stripe.com](https://stripe.com) and click **Start now**
2. Enter your email, full name, and create a password
3. Verify your email address

## Step 2: Complete Your Business Profile

Once logged in, Stripe will ask you to activate your account:

1. **Business type**: Select **Individual / Sole proprietor**
2. **Business details**: Enter "Elek Athletics" or your legal business name
3. **Personal details**: Your legal name, DOB, SSN (last 4), address
4. **Bank account**: Add the bank account where you want payouts deposited
5. **Tax info**: Stripe will send you 1099s if you exceed the threshold

> ⚠️ You can skip activation and use **Test Mode** first to make sure everything works before going live.

## Step 3: Create Your Products & Prices

This is where you set up each coaching package so Stripe knows what to charge.

1. In the Stripe Dashboard, go to **Product catalog** (left sidebar)
2. Click **+ Add product** for each package:

| Product Name | Price | Billing |
|-------------|-------|---------|
| Online Training Premium | $350.00 | **Recurring** → Monthly |
| In-Person @ Wnrs Circle | $90.00 | **One-time** |
| In-Person Outside Wnrs Circle | $135.00 | **One-time** |
| Nutrition Plan | $175.00 | **One-time** |
| In-Person Posing | $90.00 | **One-time** |
| Online Posing | $70.00 | **One-time** |

3. After creating each product, click on it and find the **Price ID** — it looks like `price_1abc123XYZ...`
4. Copy each Price ID — you'll need them in Step 5

## Step 4: Get Your API Keys

1. Go to **Developers** → **API keys** in the Stripe Dashboard
2. You'll see two keys:
   - **Publishable key**: Starts with `pk_test_` (or `pk_live_` in production)
   - **Secret key**: Starts with `sk_test_` (or `sk_live_` in production) — click "Reveal" to see it

> 🔒 **Never share your Secret Key.** It gives full access to your Stripe account.

## Step 5: Add Keys to Your Website

Open the `.env.local` file in your project and fill in:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Paste the Price IDs from Step 3:
STRIPE_PRICE_ONLINE_PREMIUM=price_...
STRIPE_PRICE_IN_PERSON_WNRS=price_...
STRIPE_PRICE_IN_PERSON_OUTSIDE=price_...
STRIPE_PRICE_NUTRITION=price_...
STRIPE_PRICE_POSING_IN_PERSON=price_...
STRIPE_PRICE_POSING_ONLINE=price_...
```

## Step 6: Set Up the Webhook

Webhooks tell your website when a payment is successful.

1. Go to **Developers** → **Webhooks** in the Stripe Dashboard
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   - **Local testing**: Use the Stripe CLI (see below)
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Under **Events to send**, select:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. On the endpoint page, find the **Signing secret** — it starts with `whsec_`
7. Add it to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

### Testing Webhooks Locally

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Install (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print a webhook signing secret — use that as `STRIPE_WEBHOOK_SECRET` for local testing.

## Step 7: Test Everything

1. Make sure you're in **Test Mode** (toggle at the top of the Stripe Dashboard)
2. Go to your booking page and submit a booking
3. On the Stripe Checkout page, use this test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g. `12/34`)
   - **CVC**: Any 3 digits (e.g. `123`)
4. Complete the payment
5. Check that:
   - ✅ You're redirected to the success page
   - ✅ The payment shows up in Stripe Dashboard → **Payments**
   - ✅ The booking appears in `data/bookings.json` with `status: "confirmed"`

## Step 8: Go Live

Once testing is complete:

1. Toggle **off** Test Mode in the Stripe Dashboard (switch to Live)
2. Go to **Developers** → **API keys** and copy your **live** keys (`sk_live_`, `pk_live_`)
3. Create the same products/prices in Live Mode (test products don't carry over)
4. Update `.env.local` with the live keys and live Price IDs
5. Set up a live webhook endpoint pointing to your production URL
6. Update `STRIPE_WEBHOOK_SECRET` with the live signing secret

---

## Quick Reference

| What | Where to Find It |
|------|-------------------|
| API Keys | Stripe Dashboard → Developers → API keys |
| Price IDs | Stripe Dashboard → Product catalog → click product → Price ID |
| Webhook Secret | Stripe Dashboard → Developers → Webhooks → click endpoint → Signing secret |
| Payments | Stripe Dashboard → Payments |
| Subscriptions | Stripe Dashboard → Subscriptions |
| Refunds | Stripe Dashboard → Payments → click payment → Refund |

## Need Help?

- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing#cards)
