# Site improvements

Review of the live site (Aug 2026). Five issues, ranked by impact when found.
All five are now addressed on `fix/redis-booking-storage` — items 1 and 2 in
commits `2627aba` and `77841a3`, items 3–5 in the commit that carries this
update. Two sub-items stay open pending information only Jon has; they're
called out under items 4 and 5.

Verified against the live site and the source, not assumed.

---

## 1. Booking API returned 500 in production — DONE (`2627aba`)

`GET /api/bookings` failed on every load of the booking form. `lib/bookings.ts`
persisted to `data/bookings.json` via `fs.writeFile` on `process.cwd()`, and
Vercel's filesystem is read-only and ephemeral: reads threw, and writes would
have vanished between invocations. Availability never greyed out, the coach
dashboard had no data, and two people could book the same slot and both pay.

Bookings and inquiries now use the Upstash client `lib/auth.ts` already
depended on, extracted to `lib/redis.ts` and shared:

```
bookings                     hash    id -> Booking
inquiries                    hash    id -> Inquiry
booking:slot:{date}:{time}   string  atomic slot claim
```

Slots are claimed with `SET NX` instead of check-then-write, so simultaneous
checkouts can't both win. The claim carries a 30-minute TTL matching the
pending-payment window; `confirmBooking` calls `PERSIST` once Stripe pays.
Public function signatures are unchanged — no route or webhook edits needed.

Requires `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or Vercel's
`KV_REST_API_*`) in **all** environments, Production included.

Verified on the preview deploy: endpoint returns 200, `fullyBookedDates`
correctly lists only Sundays, Saturday 5pm reports `closed`, calendar renders
live availability, zero console errors.

**Not yet verified end-to-end:** an actual write (`addBooking` →
`confirmBooking`) and the coach password login. The cheapest write test is the
free consult on `/coaching/custom` — that path calls `addBooking` and
`confirmBooking` directly without touching Stripe. It does send real
notification emails and fire the Zapier calendar hook.

## 2. Booking page advertised availability it didn't have — DONE (`77841a3`)

Two causes. The `Calendar` in `components/booking-form.tsx` got
`onMonthChange` but no `defaultMonth`, so it opened on the current month
while `displayedMonth` (and the availability fetch) already pointed at the
first bookable month — with a 7-day lead time the opening month is almost
entirely greyed out, so the page looked fully booked until you clicked
forward. Fixed with `defaultMonth={displayedMonth}`.

Separately the availability strip was hardcoded to "6:00am – 8:00pm" weekdays
and "7:00am – 1:00pm" Saturday, but `WEEKDAY_TIMES` has no 10–11am or 1–3pm
and `SATURDAY_TIMES` has no 10–11am. Copy is now derived from the slot arrays
via `formatSlotWindows()` in `lib/bookings.ts`, so the two can't drift again.
Change the arrays and the page follows.

Confirmed with Kody that the **slot arrays are correct** and the labels were
wrong — he has a genuine midday/afternoon gap. Don't "fix" this by adding the
missing hours back.

---

## 3. The free consult is buried and inconsistent — DONE

The hero CTA on `/` says "Book free consult" and lands on `/coaching/custom`,
a page framed as the budget tier ("Don't need all the features of the Premium
plan?"). The consult — the actual top of funnel — reads as a downgrade.

It's also called a **20-minute** call in `app/page.tsx` and a **15-minute** one
in five other places, including the confirmation emails in `lib/email.ts`.

`/coaching`'s flagship card goes straight to `/coaching/book`, where the only
action is "$350, pay now". There's no free-consult option on that page.

**Resolved.** Kody chose to reframe the existing page rather than add a route,
so there is no `/coaching/consult` and no redirects to maintain:

- The call is **15 minutes** everywhere. The lone "20-minute" line in
  `app/page.tsx` was the outlier; the five other mentions and both email
  templates already said 15, so only that line changed.
- `/coaching/custom` now leads with the consult — badge "Free consult",
  heading "Start with a free consult", and body copy that frames it as the
  front door for *any* plan. The budget-tier angle survives as one bullet
  instead of the page's premise.
- `/coaching/book` gained a "Not ready to commit? Start with a free
  15-minute consult" link, so $350-or-nothing is no longer the only action.

## 4. No SEO or social layer at all — DONE (address still open)

Nothing in `app/layout.tsx` beyond title and description. Missing:
`metadataBase`, OpenGraph and Twitter tags, an OG image, canonical URLs,
`sitemap.ts`, `robots.ts`, and `LocalBusiness` JSON-LD. Every link shared to
Instagram or texted to a prospect renders as a bare grey box.

For a Burbank trainer competing on "personal trainer near me", the structured
data — address, hours, geo, price range — is the highest-leverage item left.
Note the hours in the schema should match the real slot windows, not the old
6am–8pm claim (see item 2).

**Resolved.** Added:

- `metadataBase`, OpenGraph and Twitter defaults, and per-page
  `alternates.canonical` on all five public routes.
- `app/opengraph-image.tsx` — a 1200×630 card generated with `next/og`,
  using the site's own Anton face and brand colours (Satori needs sRGB, so the
  `oklch()` tokens are resolved to hex in that file). `twitter-image.tsx`
  re-exports it, since X does *not* fall back to the OG file convention.
- `app/sitemap.ts` and `app/robots.ts`. Robots disallows `/api/`,
  `/coach`, and the two post-checkout pages; the sitemap lists only the six
  pages worth landing on.
- `components/structured-data.tsx` — `LocalBusiness` JSON-LD rendered
  site-wide from `lib/site`, with `openingHoursSpecification` derived from
  the slot arrays, so the hours Google sees are the hours the calendar takes.

**Still open:** `streetAddress`, `postalCode`, and
`googleBusinessProfile` are empty strings in `lib/site.ts`. The schema
omits those fields rather than publishing a guess — fill them in and they
appear automatically, no other edit needed. Local ranking will be weaker until
they're set.

## 5. Local trust signals are thin or broken — PARTLY DONE

- `lib/site.ts` has `location: "Wnrs Circle · Burbank, CA"`. The About copy
  says "I train out of **Winner's Circle** in Burbank" — the abbreviation reads
  as a typo. No street address, no map, no Google Business Profile link.
- `site.ts` also has `hours: "Mon – Sat · 6:00am – 8:00pm"`, which has the same
  drift problem item 2 fixed on the booking page.
- Homepage stats "400+ clients trained" and "98% stick with it past 90 days"
  are unattributed.
- The testimonials section is headed "Real people. Real numbers." but contains
  no numbers. Jon is a competitive bodybuilder with a novice overall title —
  actual before/after results would carry that section.
- `components/site-footer.tsx` still carries "Built with Next.js & shadcn/ui —
  designed for hard work", a developer credit on a client-facing business page.

**Fixed:**

- `location` now reads "Winner's Circle · Burbank, CA".
- `hours` is derived from the slot arrays and split into weekday/Saturday
  lines in both the footer and the About contact card, so it can't drift.
- The developer credit is gone, replaced with "Personal training in Burbank &
  the greater Los Angeles area" — the footer slot now earns its keep locally.
- The testimonials heading is "Real people. Real results." The section still
  carries no figures, and the old heading promised some.

**Left alone on Kody's call:** the "400+ clients trained" and "98% stick with
it past 90 days" stats stay as written. He can substantiate them.

**Still open:** no street address, map, or Google Business Profile link (same
blocker as item 4), and no before/after numbers in the testimonials section.

---

## Notes for whoever picks this up

- **Line endings are mixed** in the working tree — `booking-form.tsx` and
  `bookings.ts` are CRLF, `coaching/book/page.tsx` is LF, and the repo stores
  LF. Stage with `git -c core.autocrlf=input add` to avoid committing
  whole-file line-ending churn. Still true, and still the way to stage.
- `eslint` reports two pre-existing `react-hooks/set-state-in-effect` errors in
  `booking-form.tsx` (now lines 101 and 123 — the file shrank by 14). They
  predate this work. Performance advisory, not a bug. `eslint src` reports
  three more pre-existing errors nobody has touched: one in `coach/page.tsx`
  and two `no-explicit-any` in `api/coach/create-payment-link`.
- `data/inquiries.json` has been removed from tracking. Note this only drops
  it from HEAD — the address is still in git history, and purging that needs a
  history rewrite.
- `.env.local.example` documents the Upstash vars but is **untracked** — the
  `.gitignore` excludes all `.env*`.
- `data/inquiries.json` is committed to git and contains a real email address.
  Now unused by the code; worth scrubbing.
- `npm run build` won't run under WSL//mnt with Windows-installed
  `node_modules` (Linux SWC binary can't download). Build on Windows.

## Found while doing items 3–5 — both open

- **`app/about/page.tsx` has a dead `credentials` array** containing
  `"University of Whatever, 2014"` next to the real NSCA-CSCS and Precision
  Nutrition entries. Nothing renders it, so it isn't live — eslint flags it as
  unused. Either wire it into the About page with Jon's real degree or delete
  it; leaving a fake credential in the file is asking for it to ship one day.
- **The consult ICS blocks a full hour.** `buildICS` in `lib/email.ts` is
  hardcoded to `start + 60 * 60 * 1000`, so a client who books the "free
  15-minute consult" gets a 60-minute block on their calendar. Blocking the
  hour on *Jon's* side is right — the slot claim is hourly — but the client
  invite should probably match the 15 minutes they were promised.
- **The slot arrays had a third copy.** `components/booking-form.tsx` carried
  its own `WEEKDAY_TIMES`/`SATURDAY_TIMES`/`getTimeSlotsForDate`, the same
  drift hazard item 2 fixed. All three copies now come from the new pure
  `lib/availability.ts`; `lib/bookings.ts` re-exports it so the API routes
  and booking page imports are unchanged, and `lib/site.ts` can read the
  windows without pulling Redis into the client bundle.

---

## Flow change: consultation-only booking (Aug 2026)

Clients no longer pay through the site. Every booking made on the site is a
free consultation; Elek sends a Stripe payment link from the coach dashboard
after the call. The dashboard's link generator is unchanged and was already
the only payment path that worked.

**Why.** "Book & pay" was broken in production while the payment links worked,
and the asymmetry explains itself: `api/coach/create-payment-link` creates a
Product and Price at runtime, so it works under whichever key it is given.
Checkout referenced a fixed `STRIPE_PRICE_EVERYTHING_INCLUDED`, and a Stripe
price ID only exists in the mode it was created in — a test-mode price is
invisible to a live key. Rather than maintain a price ID, a `mode` flag, and a
mode-specific webhook signing secret in step with the dashboard, the site now
has no payment surface at all.

**Removed:** `/coaching/book`, `/coaching/cancel`, `api/webhooks/stripe`,
`PACKAGE_PRICES`, and `sendPaidBookingNotification`. `api/checkout` became
`api/consultations` — it no longer touches Stripe, forces the package to
`consultation` server-side regardless of the request body, and returns a
booking id rather than an absolute URL, so the consult path no longer depends
on `BASE_URL`.

**Kept:** `getStripe()` and the payment-link route. The $350/mo price still
appears on `/coaching` and in the JSON-LD offer — only the call to action
changed, from "Start coaching" to "Book a free consult".

**Repointed:** the three header CTAs, the About CTA, and the flagship plan card
all now go to `/coaching/custom`. `/coaching/book` was deleted rather than
redirected, so any old link to it 404s.

**Env vars now unused in production:** `STRIPE_PRICE_EVERYTHING_INCLUDED` and
`STRIPE_WEBHOOK_SECRET` can be deleted from Vercel. `STRIPE_SECRET_KEY` is
still required — the payment-link generator needs it, and it should be a live
key. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `ZAPIER_WEBHOOK_URL` were
already read by nothing.

**Also removed:** the booking form's in-component success screen. It was
unreachable — `setSuccessData` was only ever called with `null`, so the form
always redirected to `/coaching/success`. It had "add to Google/Apple
Calendar" buttons that never rendered; the confirmation email's ICS attachment
covers that.

**Consequence worth knowing:** the consultation confirmation email is now the
only confirmation a client receives. If Resend is misconfigured, a client books
and hears nothing. `RESEND_API_KEY` and a verified-domain `EMAIL_FROM` are
no longer optional polish.

---

## Branded transactional email (Aug 2026)

The three notification emails were unstyled `<h2>` + `<table cellpadding="6">`
fragments. They now share `lib/email-template.ts`, which renders a branded
600px layout: dark header band, logo, purple rule, detail rows, footer with
Jon's contact details.

**Why it is built the way it is.** Email clients are not browsers — Outlook
renders through Word and Gmail strips `<style>` blocks — so the template is
table-based with inline styles only. No flexbox, no grid, no media queries
relied upon. The container is fluid with `max-width:600px` and carries an MSO
conditional wrapper, because Outlook ignores `max-width` and would otherwise
render it full-bleed.

**The logo.** `public/logo.png` is 1024x1024 and 1.4 MB with a dark background
baked in — unusable in email, and it would have shown as a dark square on the
light body. `public/email-logo.png` is instead rasterized from
`public/ea-logo.svg` with sharp (already present as a Next dependency): 240x214,
18 KB, transparent. The mark is metallic and disappears on white, which is why
the header band is dark.

The wordmark under the logo is real text, not part of the image, so the email
still reads as Elek Athletics when a client blocks images — which most do by
default for a first-time sender.

**Deploy order matters.** The `<img src>` is absolute
(`https://elekathletics.com/email-logo.png`). Any email sent before this
deploys will show a broken logo.

---

## Split sender for coach-facing email (Aug 2026)

The two emails that go *to* Elek (new consult booked, new inquiry) now send
from a different address than the client confirmation.

**Why.** `elekathletics.com` is on Google Workspace (`MX 1 smtp.google.com`).
Switching `EMAIL_FROM` to `Jon@elekathletics.com` — worth doing, since Gmail
may then show his profile photo as the sender avatar — would have made the
coach notifications From Jon, To Jon, relayed by Resend. Workspace treats mail
claiming to be from your own domain arriving on outside infrastructure as
spoofing and can quarantine it even when DMARC passes. The booking
notification is the one email he cannot afford to miss.

**How.** `COACH_NOTIFICATION_FROM` overrides the sender for those two emails.
When it is unset, `pickCoachNotificationFrom()` compares mailboxes
case-insensitively and, only on a collision, substitutes
`hello@<domain>` and logs a warning. An explicit setting always wins. So the
trap cannot be re-entered by setting `EMAIL_FROM` and forgetting this.

Replies are unaffected: both coach emails set `replyTo` to the client, so the
From address is never the one anyone answers, and it does not need to be a
real mailbox.

**Not covered:** the domain's DMARC is `p=none` with no `rua=`, so
authentication failures go unreported. Worth adding a reporting address.
