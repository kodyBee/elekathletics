"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Send } from "lucide-react";
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
  { value: "intro", label: "Free 20-min intro call" },
  { value: "single", label: "Single 1-on-1 session" },
  { value: "starter", label: "Starter pack — 4 sessions" },
  { value: "online", label: "Online coaching (monthly)" },
  { value: "elite", label: "Elite hybrid (in-person + online)" },
];

const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "12:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export function BookingForm() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [pkg, setPkg] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name || !email || !pkg || !date || !time) {
      toast.error("Please complete every field before submitting.");
      return;
    }

    setSubmitting(true);
    // Simulated submission — wire up to your API / form service later.
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Request received!", {
        description: `Thanks ${name}, I'll confirm ${format(date, "EEE, MMM d")} @ ${time} within 24 hours.`,
      });
      form.reset();
      setDate(undefined);
      setPkg("");
      setTime("");
    }, 900);
  }

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
          <Input id="phone" name="phone" type="tel" placeholder="+1 555 555 5555" />
        </div>
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
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Preferred time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger id="time" className="w-full">
              <SelectValue placeholder="Pick a time" />
            </SelectTrigger>
            <SelectContent>
              {TIMES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
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

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" /> Request booking
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        You&apos;ll get a confirmation email within 24 hours. No card required to
        request a session.
      </p>
    </form>
  );
}
