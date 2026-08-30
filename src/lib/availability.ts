/**
 * Bookable time slots, and every piece of copy derived from them.
 *
 * Pure module — no Redis, no server-only imports — so the client booking form,
 * the server booking page, and the site-wide contact details can all read the
 * same source. Change the arrays below and every place that advertises hours
 * follows: the availability strip, the footer, the About page, and the
 * opening-hours structured data.
 */

// Weekdays: 6-10am · 12-1pm · 4-8pm  |  Saturday: 7-10am · 12-1pm  |  Sunday: closed
// Sessions are an hour, so each entry is a *start* time.

export const WEEKDAY_TIMES = [
  "06:00", "07:00", "08:00", "09:00",
  "12:00", "16:00", "17:00", "18:00", "19:00",
];

export const SATURDAY_TIMES = [
  "07:00", "08:00", "09:00", "12:00",
];

/**
 * Collapses a slot list into the hour spans the gym is actually occupied.
 * A run of consecutive starts becomes one span, and because a session runs an
 * hour the span ends an hour after the last start:
 * ["06:00","07:00","08:00","09:00"] -> [[6, 10]].
 */
function slotRuns(times: string[]): Array<[number, number]> {
  if (times.length === 0) return [];

  const hours = [...times]
    .map((t) => Number(t.slice(0, 2)))
    .sort((a, b) => a - b);

  const runs: Array<[number, number]> = [];
  let runStart = hours[0];
  let prev = hours[0];
  for (const h of hours.slice(1)) {
    if (h === prev + 1) {
      prev = h;
      continue;
    }
    runs.push([runStart, prev + 1]);
    runStart = h;
    prev = h;
  }
  runs.push([runStart, prev + 1]);
  return runs;
}

function formatHour(hour24: number): { label: string; meridiem: "am" | "pm" } {
  const meridiem = hour24 % 24 < 12 ? "am" : "pm";
  const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { label: String(h), meridiem };
}

/** Human-readable session windows, e.g. "6 - 10am · 12 - 1pm · 4 - 8pm". */
export function formatSlotWindows(times: string[]): string {
  if (times.length === 0) return "Closed";

  return slotRuns(times)
    .map(([start, end]) => {
      const from = formatHour(start);
      const to = formatHour(end);
      return from.meridiem === to.meridiem
        ? `${from.label} - ${to.label}${to.meridiem}`
        : `${from.label}${from.meridiem} - ${to.label}${to.meridiem}`;
    })
    .join(" · ");
}

export const availabilityWindows = {
  weekdays: formatSlotWindows(WEEKDAY_TIMES),
  saturday: formatSlotWindows(SATURDAY_TIMES),
};

/**
 * Schema.org `OpeningHoursSpecification` entries, derived from the same slot
 * arrays so the structured data can't advertise hours the calendar won't take.
 */
export const openingHoursSpecification = [
  ...slotRuns(WEEKDAY_TIMES).map(([open, close]) => ({
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: `${String(open).padStart(2, "0")}:00`,
    closes: `${String(close).padStart(2, "0")}:00`,
  })),
  ...slotRuns(SATURDAY_TIMES).map(([open, close]) => ({
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Saturday"],
    opens: `${String(open).padStart(2, "0")}:00`,
    closes: `${String(close).padStart(2, "0")}:00`,
  })),
];

/**
 * Available start times for an ISO date string. Sunday is closed.
 */
export function getTimeSlotsForDate(dateStr: string): string[] {
  const dow = new Date(dateStr + "T12:00:00").getDay(); // 0 = Sun … 6 = Sat
  if (dow === 0) return [];          // Sunday — closed
  if (dow === 6) return SATURDAY_TIMES;
  return WEEKDAY_TIMES;
}
