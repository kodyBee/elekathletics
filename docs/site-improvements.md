# Site improvements

Review of the live site (Aug 2026). Five issues, ranked by impact when found.
Items 1 and 2 are done and sitting on the branch `fix/redis-booking-storage`
(commits `2627aba`, `77841a3`). Items 3–5 are open.

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

## 3. The free consult is buried and inconsistent — OPEN

The hero CTA on `/` says "Book free consult" and lands on `/coaching/custom`,
a page framed as the budget tier ("Don't need all the features of the Premium
plan?"). The consult — the actual top of funnel — reads as a downgrade.

It's also called a **20-minute** call in `app/page.tsx` and a **15-minute** one
in five other places, including the confirmation emails in `lib/email.ts`.

`/coaching`'s flagship card goes straight to `/coaching/book`, where the only
action is "$350, pay now". There's no free-consult option on that page.

Suggested: give the consult its own route, make the duration consistent, and
offer it as a path on `/coaching/book`.

## 4. No SEO or social layer at all — OPEN

Nothing in `app/layout.tsx` beyond title and description. Missing:
`metadataBase`, OpenGraph and Twitter tags, an OG image, canonical URLs,
`sitemap.ts`, `robots.ts`, and `LocalBusiness` JSON-LD. Every link shared to
Instagram or texted to a prospect renders as a bare grey box.

For a Burbank trainer competing on "personal trainer near me", the structured
data — address, hours, geo, price range — is the highest-leverage item left.
Note the hours in the schema should match the real slot windows, not the old
6am–8pm claim (see item 2).

## 5. Local trust signals are thin or broken — OPEN

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

---

## Notes for whoever picks this up

- **Line endings are mixed** in the working tree — `booking-form.tsx` and
  `bookings.ts` are CRLF, `coaching/book/page.tsx` is LF, and the repo stores
  LF. Stage with `git -c core.autocrlf=input add` to avoid committing
  whole-file line-ending churn.
- `eslint` reports two pre-existing `react-hooks/set-state-in-effect` errors in
  `booking-form.tsx` (lines 115 and 137). They predate this work. Performance
  advisory, not a bug.
- `.env.local.example` documents the Upstash vars but is **untracked** — the
  `.gitignore` excludes all `.env*`.
- `data/inquiries.json` is committed to git and contains a real email address.
  Now unused by the code; worth scrubbing.
- `npm run build` won't run under WSL//mnt with Windows-installed
  `node_modules` (Linux SWC binary can't download). Build on Windows.
