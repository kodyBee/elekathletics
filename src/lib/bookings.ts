import { startOfDay, addDays } from "date-fns";

import { getRedis, parseRecord } from "@/lib/redis";

// ─── Types ──────────────────────────────────────────────────────────────────

export type BookingStatus = "pending_payment" | "confirmed";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;   // ISO date string, e.g. "2026-07-01"
  time: string;   // 24-hour format, e.g. "09:00"
  package: string;
  goals?: string;
  status: BookingStatus;
  stripeSessionId?: string;
  createdAt: string;
}

export interface BookingInput {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  package: string;
  goals?: string;
}

// ─── Available times per day-of-week ────────────────────────────────────────
// Weekdays: 6am–7pm  |  Saturday: 7am–1pm  |  Sunday: closed

const WEEKDAY_TIMES = [
  "06:00", "07:00", "08:00", "09:00",
  "12:00", "16:00", "17:00", "18:00", "19:00",
];

const SATURDAY_TIMES = [
  "07:00", "08:00", "09:00", "12:00",
];

/**
 * Returns the available time slots for a given date string (ISO).
 * Sunday returns an empty array (closed).
 */
export function getTimeSlotsForDate(dateStr: string): string[] {
  const dow = new Date(dateStr + "T12:00:00").getDay(); // 0 = Sun … 6 = Sat
  if (dow === 0) return [];          // Sunday — closed
  if (dow === 6) return SATURDAY_TIMES;
  return WEEKDAY_TIMES;
}

// ─── Redis keys ─────────────────────────────────────────────────────────────
//
// bookings                      hash   id -> Booking JSON
// booking:slot:{date}:{time}    string bookingId — the atomic slot claim.
//                                      Expires with the pending hold; made
//                                      permanent once payment is confirmed.

const BOOKINGS_KEY = "bookings";

const PENDING_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const PENDING_TIMEOUT_SEC = PENDING_TIMEOUT_MS / 1000;

function slotKey(dateStr: string, time: string): string {
  return `booking:slot:${dateStr}:${time}`;
}

function isExpiredPending(b: Booking, now: number): boolean {
  if (b.status !== "pending_payment") return false;
  return now - new Date(b.createdAt).getTime() >= PENDING_TIMEOUT_MS;
}

/**
 * Loads every booking, dropping pending holds that have timed out.
 *
 * Expired holds are purged in the background so a read never blocks on the
 * cleanup round trip. The slot claim keys expire on their own TTL, so a failed
 * purge frees the slot regardless.
 */
async function loadBookings(): Promise<Booking[]> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, unknown>>(BOOKINGS_KEY);
  if (!raw) return [];

  const now = Date.now();
  const live: Booking[] = [];
  const expired: Booking[] = [];

  for (const value of Object.values(raw)) {
    const booking = parseRecord<Booking>(value);
    if (!booking) continue;
    if (isExpiredPending(booking, now)) expired.push(booking);
    else live.push(booking);
  }

  if (expired.length > 0) void purgeExpired(expired);

  return live;
}

async function purgeExpired(expired: Booking[]): Promise<void> {
  try {
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.hdel(BOOKINGS_KEY, ...expired.map((b) => b.id));
    for (const b of expired) pipeline.del(slotKey(b.date, b.time));
    await pipeline.exec();
  } catch (error) {
    console.error("[bookings] failed to purge expired holds", error);
  }
}

export async function getBookings(): Promise<Booking[]> {
  return loadBookings();
}

// ─── Query helpers ──────────────────────────────────────────────────────────

export async function getBookingsForDate(dateStr: string): Promise<Booking[]> {
  const all = await loadBookings();
  return all.filter((b) => b.date === dateStr);
}

export async function isSlotAvailable(
  dateStr: string,
  time: string
): Promise<boolean> {
  const dayBookings = await getBookingsForDate(dateStr);
  // Both pending_payment and confirmed bookings hold the slot
  return !dayBookings.some((b) => b.time === time);
}

export async function getBookedSlots(dateStr: string): Promise<string[]> {
  const dayBookings = await getBookingsForDate(dateStr);
  return dayBookings.map((b) => b.time);
}

/** Formats a UTC-anchored Date as an ISO calendar date (YYYY-MM-DD). */
function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns ISO date strings within [start, end) that have every available
 * time slot booked (i.e. the day is fully booked).
 */
export async function getFullyBookedDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  const all = await loadBookings();

  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const fullyBooked: string[] = [];

  const bookedByDate = new Map<string, Set<string>>();
  for (const b of all) {
    if (!bookedByDate.has(b.date)) bookedByDate.set(b.date, new Set());
    bookedByDate.get(b.date)!.add(b.time);
  }

  for (
    let d = new Date(start);
    d < end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const iso = toIsoDate(d);
    const slots = getTimeSlotsForDate(iso);
    if (slots.length === 0) {
      // Sunday — treat as fully booked so it greys out
      fullyBooked.push(iso);
      continue;
    }
    const booked = bookedByDate.get(iso);
    if (booked && slots.every((s) => booked.has(s))) {
      fullyBooked.push(iso);
    }
  }

  return fullyBooked;
}

/**
 * Returns booked-slot map for every day in a given month.
 * Key = ISO date, value = array of booked time strings.
 */
export async function getMonthBookedSlots(
  year: number,
  month: number // 1-indexed
): Promise<Record<string, string[]>> {
  const all = await loadBookings();
  const result: Record<string, string[]> = {};

  for (const b of all) {
    const d = new Date(b.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      if (!result[b.date]) result[b.date] = [];
      result[b.date].push(b.time);
    }
  }

  return result;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

const MIN_LEAD_DAYS = 7;

export async function addBooking(
  input: BookingInput
): Promise<{ ok: true; booking: Booking } | { ok: false; error: string; status: number }> {
  // 1. Validate the 7-day buffer server-side
  const requestedDate = new Date(input.date + "T12:00:00");
  const earliest = addDays(startOfDay(new Date()), MIN_LEAD_DAYS);
  if (requestedDate < earliest) {
    return {
      ok: false,
      error: `Bookings must be at least ${MIN_LEAD_DAYS} days in advance.`,
      status: 400,
    };
  }

  // 2. Check that the time slot is valid for this day
  const validSlots = getTimeSlotsForDate(input.date);
  if (!validSlots.includes(input.time)) {
    return {
      ok: false,
      error: `The time ${input.time} is not available on ${input.date}.`,
      status: 400,
    };
  }

  const redis = getRedis();
  const booking: Booking = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone || undefined,
    date: input.date,
    time: input.time,
    package: input.package,
    goals: input.goals || undefined,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };

  // 3. Claim the slot atomically. SET NX is the single source of truth for
  //    "is this slot taken" — two people checking out at the same moment can
  //    no longer both win. The TTL matches the pending-payment window, so an
  //    abandoned checkout releases the slot on its own.
  const claimed = await redis.set(slotKey(input.date, input.time), booking.id, {
    nx: true,
    ex: PENDING_TIMEOUT_SEC,
  });

  if (claimed !== "OK") {
    return {
      ok: false,
      error: "This time slot is already booked. Please choose a different time.",
      status: 409,
    };
  }

  // 4. Persist the booking. If this fails, release the claim so the slot
  //    doesn't sit blocked for the full TTL.
  try {
    await redis.hset(BOOKINGS_KEY, { [booking.id]: JSON.stringify(booking) });
  } catch (error) {
    await redis.del(slotKey(input.date, input.time)).catch(() => {});
    throw error;
  }

  return { ok: true, booking };
}

/**
 * Confirms a booking after successful payment.
 * Called by the Stripe webhook handler.
 */
export async function confirmBooking(
  bookingId: string,
  stripeSessionId: string
): Promise<boolean> {
  const redis = getRedis();
  const booking = await getBookingById(bookingId);
  if (!booking) return false;

  const confirmed: Booking = {
    ...booking,
    status: "confirmed",
    stripeSessionId,
  };

  await redis.hset(BOOKINGS_KEY, { [bookingId]: JSON.stringify(confirmed) });

  // The hold is now a permanent reservation — drop the expiry from the claim.
  await redis.persist(slotKey(booking.date, booking.time)).catch(() => {});

  return true;
}

/**
 * Retrieves a single booking by ID.
 */
export async function getBookingById(
  bookingId: string
): Promise<Booking | null> {
  const redis = getRedis();
  const raw = await redis.hget(BOOKINGS_KEY, bookingId);
  return parseRecord<Booking>(raw);
}
