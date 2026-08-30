"use client";

import * as React from "react";
import { format, addDays, startOfDay } from "date-fns";
import { CalendarIcon, Loader2, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Slot arrays live in `lib/availability` — the same module the server reads —
// so the form can never offer a time the booking API would reject.
import { getTimeSlotsForDate } from "@/lib/availability";

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ─── Availability types ─────────────────────────────────────────────────────

interface MonthAvailability {
  bookedSlots: Record<string, string[]>;
  fullyBookedDates: string[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BookingForm() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  // Availability state
  const [availability, setAvailability] = React.useState<MonthAvailability>({
    bookedSlots: {},
    fullyBookedDates: [],
  });
  const [loadingAvailability, setLoadingAvailability] = React.useState(false);
  const [displayedMonth, setDisplayedMonth] = React.useState<Date>(
    addDays(startOfDay(new Date()), 7)
  );

  // ── Fetch availability when the displayed month changes ────────────────
  const fetchAvailability = React.useCallback(async (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/bookings?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability({
          bookedSlots: data.bookedSlots ?? {},
          fullyBookedDates: data.fullyBookedDates ?? [],
        });
      }
    } catch {
      // Silently fail — calendar will still work, just without availability info
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAvailability(displayedMonth);
  }, [displayedMonth, fetchAvailability]);

  // ── Derived: time slots for selected date ──────────────────────────────
  const selectedDateStr = date
    ? date.toISOString().split("T")[0]
    : null;

  const availableTimeSlots = React.useMemo(() => {
    if (!selectedDateStr) return [];
    return getTimeSlotsForDate(selectedDateStr);
  }, [selectedDateStr]);

  const bookedTimesForDate = React.useMemo(() => {
    if (!selectedDateStr) return [];
    return availability.bookedSlots[selectedDateStr] ?? [];
  }, [selectedDateStr, availability.bookedSlots]);

  const openSlotCount = availableTimeSlots.length - bookedTimesForDate.length;

  // Reset time when date changes (the previously-picked time might be invalid)
  React.useEffect(() => {
    setTime("");
  }, [selectedDateStr]);

  // ── Calendar disabled logic ────────────────────────────────────────────
  const disabledDays = React.useMemo(() => {
    const matchers: Array<{ before: Date } | Date | ((d: Date) => boolean)> = [
      { before: addDays(startOfDay(new Date()), 7) },
    ];

    // Disable Sundays
    matchers.push((d: Date) => d.getDay() === 0);

    // Disable fully-booked dates
    for (const isoStr of availability.fullyBookedDates) {
      // Skip Sundays — already covered above
      const d = new Date(isoStr + "T12:00:00");
      if (d.getDay() !== 0) {
        matchers.push(d);
      }
    }

    return matchers;
  }, [availability.fullyBookedDates]);

  // ── Submit handler ─────────────────────────────────────────────────────
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const goals = String(data.get("goals") ?? "").trim();

    if (!name || !email || !date || !time) {
      toast.error("Please complete every field before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          date: date.toISOString().split("T")[0],
          time,
          goals: goals || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // If it's a 409 conflict, re-fetch availability so the UI updates
        if (res.status === 409) {
          toast.error(result.error || "This slot was just booked. Please choose another time.");
          fetchAvailability(displayedMonth);
          setTime("");
        } else {
          toast.error(result.error || "Something went wrong. Please try again.");
        }
        return;
      }

      // Nothing to pay for, so this is a plain in-app navigation — no
      // absolute URL and no dependency on BASE_URL.
      if (result.bookingId) {
        window.location.href = "/coaching/success";
      } else {
        toast.error("Could not complete booking. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Spans the row: the package selector that used to sit beside this
            is gone, and a half-width field with a gap reads as unfinished. */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 555 555 5555"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Preferred date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start px-3 text-left text-base font-normal h-10 md:h-9 md:text-sm",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto max-w-[calc(100vw-2rem)] p-0"
              align="start"
              sideOffset={8}
              collisionPadding={16}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d && d < addDays(startOfDay(new Date()), 7)) {
                    toast.error(
                      "This date is unavailable. Please select a date at least 7 days from today."
                    );
                    return;
                  }
                  setDate(d);
                }}
                disabled={disabledDays}
                defaultMonth={displayedMonth}
                onMonthChange={(m) => setDisplayedMonth(m)}
                autoFocus
              />
              {loadingAvailability && (
                <div className="flex items-center justify-center gap-2 px-4 pb-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Loading availability…
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Slot availability indicator */}
          {date && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs transition-all duration-200",
                openSlotCount <= 2
                  ? "text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              {openSlotCount <= 2 ? (
                <AlertCircle className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              {openSlotCount === 0 ? (
                <span>No slots left — pick another date</span>
              ) : openSlotCount === 1 ? (
                <span>1 slot remaining</span>
              ) : (
                <span>{openSlotCount} slots available</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Preferred time</Label>
          <Select
            value={time}
            onValueChange={setTime}
            disabled={!date || availableTimeSlots.length === 0}
          >
            <SelectTrigger id="time" className="w-full">
              <SelectValue
                placeholder={
                  !date
                    ? "Select a date first"
                    : availableTimeSlots.length === 0
                      ? "No times available"
                      : "Pick a time"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((t) => {
                const isBooked = bookedTimesForDate.includes(t);
                return (
                  <SelectItem
                    key={t}
                    value={t}
                    disabled={isBooked}
                    className={cn(isBooked && "opacity-50")}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(isBooked && "line-through")}>
                        {formatTime12h(t)}
                      </span>
                      {isBooked && (
                        <span className="text-xs text-muted-foreground">
                          Booked
                        </span>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Your goals</Label>
        <Textarea
          id="goals"
          name="goals"
          rows={4}
          placeholder="Tell me what you want to achieve, your training history, and anything I should know."
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" /> Book consultation
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        You&apos;ll get a confirmation email with a calendar invite shortly. No
        card required.
      </p>
    </form>
  );
}
