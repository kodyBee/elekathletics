import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { startOfDay, addDays } from "date-fns";

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

// ─── File helpers ───────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

async function ensureDataFile(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function getBookings(): Promise<Booking[]> {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Booking[];
}

async function saveBookings(bookings: Booking[]): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

const PENDING_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Removes pending_payment bookings older than 30 minutes.
 * Called before reads to keep stale holds from blocking slots.
 */
async function cleanupExpiredPending(): Promise<void> {
  const all = await getBookings();
  const now = Date.now();
  const cleaned = all.filter((b) => {
    if (b.status !== "pending_payment") return true;
    const age = now - new Date(b.createdAt).getTime();
    return age < PENDING_TIMEOUT_MS;
  });
  if (cleaned.length !== all.length) {
    await saveBookings(cleaned);
  }
}

// ─── Query helpers ──────────────────────────────────────────────────────────

export async function getBookingsForDate(dateStr: string): Promise<Booking[]> {
  await cleanupExpiredPending();
  const all = await getBookings();
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

/**
 * Returns ISO date strings within [start, end) that have every available
 * time slot booked (i.e. the day is fully booked).
 */
export async function getFullyBookedDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  await cleanupExpiredPending();
  const all = await getBookings();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const fullyBooked: string[] = [];

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    const slots = getTimeSlotsForDate(iso);
    if (slots.length === 0) {
      // Sunday — treat as fully booked so it greys out
      fullyBooked.push(iso);
      continue;
    }
    const booked = all.filter((b) => b.date === iso).map((b) => b.time);
    if (slots.every((s) => booked.includes(s))) {
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
  await cleanupExpiredPending();
  const all = await getBookings();
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

  // 3. Check slot availability (includes pending bookings)
  const available = await isSlotAvailable(input.date, input.time);
  if (!available) {
    return {
      ok: false,
      error: "This time slot is already booked. Please choose a different time.",
      status: 409,
    };
  }

  // 4. Create the booking with pending status
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

  const bookings = await getBookings();
  bookings.push(booking);
  await saveBookings(bookings);

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
  const bookings = await getBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) return false;

  bookings[idx].status = "confirmed";
  bookings[idx].stripeSessionId = stripeSessionId;
  await saveBookings(bookings);
  return true;
}

/**
 * Retrieves a single booking by ID.
 */
export async function getBookingById(
  bookingId: string
): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find((b) => b.id === bookingId) ?? null;
}
