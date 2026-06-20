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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PACKAGES = [
  { value: "online-premium", label: "Online Training Premium — $350/mo" },
  { value: "in-person-wnrs", label: "In-Person @ Wnrs Circle — $90/hr" },
  { value: "in-person-outside", label: "In-Person Outside Wnrs Circle — $135/hr" },
  { value: "nutrition", label: "Nutrition Plan — $175 one-time" },
  { value: "posing-in-person", label: "In-Person Posing — $90 / 45 min" },
  { value: "posing-online", label: "Online Posing — $70 / 45 min" },
];

// All possible time slots — the form will filter by day-of-week availability
// and disable already-booked ones.
const WEEKDAY_TIMES = [
  "06:00", "07:00", "08:00", "09:00",
  "12:00", "16:00", "17:00", "18:00", "19:00",
];

const SATURDAY_TIMES = [
  "07:00", "08:00", "09:00", "12:00",
];

function getTimeSlotsForDate(dateStr: string): string[] {
  const dow = new Date(dateStr + "T12:00:00").getDay();
  if (dow === 0) return [];
  if (dow === 6) return SATURDAY_TIMES;
  return WEEKDAY_TIMES;
}

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

export function BookingForm({
  defaultPackage = "",
  hidePackageSelection = false,
}: {
  defaultPackage?: string;
  hidePackageSelection?: boolean;
}) {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [pkg, setPkg] = React.useState<string>(defaultPackage);
  const [time, setTime] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [successData, setSuccessData] = React.useState<{
    name: string;
    date: Date;
    time: string;
    pkg: string;
  } | null>(null);

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

    if (!name || !email || !pkg || !date || !time) {
      toast.error("Please complete every field before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          date: date.toISOString().split("T")[0],
          time,
          package: pkg,
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

      // Redirect to Stripe Checkout or Success page
      if (result.successUrl) {
        window.location.href = result.successUrl;
      } else if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error("Could not complete booking. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (successData) {
    const selectedPkg =
      PACKAGES.find((p) => p.value === successData.pkg)?.label ||
      "Training Session";
    const [hours, minutes] = successData.time.split(":").map(Number);

    const start = new Date(successData.date);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setHours(hours + 1, minutes, 0, 0);

    const formatICSDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = encodeURIComponent(
      `Training with Elek - ${selectedPkg}`
    );
    const details = encodeURIComponent(
      `Booking request for ${successData.name}.`
    );

    const googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatICSDate(start)}/${formatICSDate(end)}&details=${details}`;

    const handleAppleCalendar = () => {
      const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:Training with Elek - ${selectedPkg}
DESCRIPTION:Booking request for ${successData.name}.
END:VEVENT
END:VCALENDAR`;
      const blob = new Blob([ics], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "training_session.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center fade-in animate-in">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">
            Request received!
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Thanks {successData.name}, I&apos;ll confirm{" "}
            {format(successData.date, "EEEE, MMMM do")} @{" "}
            {formatTime12h(successData.time)} within 24 hours.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row w-full max-w-md pt-4">
          <Button asChild className="w-full">
            <a
              href={googleCalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Google Calendar
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAppleCalendar}
          >
            Add to Apple Calendar
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setSuccessData(null);
            setDate(undefined);
            setPkg("");
            setTime("");
          }}
          className="mt-4"
        >
          Book another session
        </Button>
      </div>
    );
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
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 555 555 5555"
          />
        </div>
        {!hidePackageSelection && (
          <div className="space-y-2">
            <Label htmlFor="package">Package</Label>
            <Select value={pkg} onValueChange={setPkg}>
              <SelectTrigger id="package" className="w-full">
                <SelectValue placeholder="Choose a package" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
            <Send className="mr-2 size-4" /> {pkg === "consultation" ? "Book consultation" : "Book & pay"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        {pkg === "consultation"
          ? "You'll get a confirmation email shortly. No card required."
          : "You'll be redirected to Stripe to complete payment securely. Your slot is held for 30 minutes while you check out."}
      </p>
    </form>
  );
}
