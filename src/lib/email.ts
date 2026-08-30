import { Resend } from "resend";
import { siteConfig } from "./site";
import type { Booking } from "./bookings";
import type { Inquiry } from "./inquiries";
import { renderEmail } from "./email-template";

/**
 * Lazy Resend instance — initialised on first use so the build doesn't
 * crash when RESEND_API_KEY isn't configured yet.
 */
let _resend: Resend | null = null;

let _warnedNoKey = false;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Every sender bails out early when this is null. Without a log that is
    // indistinguishable from mail being sent successfully.
    if (!_warnedNoKey) {
      console.error(
        "[Email] RESEND_API_KEY is not set — no mail will be sent from this environment."
      );
      _warnedNoKey = true;
    }
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

function coachEmail(): string {
  return process.env.COACH_EMAIL || siteConfig.contact.email;
}

function coachDashboardUrl(): string {
  return `${process.env.BASE_URL || "http://localhost:3000"}/coach`;
}

function fromAddress(): string {
  // Resend requires either onboarding@resend.dev (sandbox) or a verified domain.
  return process.env.EMAIL_FROM || "Elek Athletics <onboarding@resend.dev>";
}

/** Bare address from either `addr@x.com` or `Name <addr@x.com>`. */
function mailboxOf(addr: string): string {
  const angled = addr.match(/<([^>]+)>/);
  return (angled ? angled[1] : addr).trim().toLowerCase();
}

/**
 * Decides who the two coach-facing emails are sent *from*.
 *
 * Kept pure so the collision rule can be reasoned about on its own; the env
 * lookups live in `coachNotificationFrom()`.
 */
export function pickCoachNotificationFrom(opts: {
  explicit?: string;
  from: string;
  coachTo: string;
}): { from: string; substituted: boolean } {
  // An explicit setting always wins — the operator gets the last word.
  if (opts.explicit) return { from: opts.explicit, substituted: false };

  if (mailboxOf(opts.from) !== mailboxOf(opts.coachTo)) {
    return { from: opts.from, substituted: false };
  }

  const domain = mailboxOf(opts.coachTo).split("@")[1];
  return { from: `Elek Athletics <hello@${domain}>`, substituted: true };
}

let _warnedSelfAddressed = false;

/**
 * Sender for the emails that go *to* Elek.
 *
 * If these went out from the same mailbox they arrive at, he'd be receiving
 * mail from himself relayed by third-party infrastructure. Google Workspace
 * — which hosts this domain — treats that as domain spoofing and can
 * quarantine it even when DMARC passes. The booking notification is the one
 * email he cannot afford to miss, so a collision is broken rather than sent.
 *
 * Replies still reach the right person: both coach emails set `replyTo` to
 * the client, so this address is never the one anyone answers.
 */
function coachNotificationFrom(): string {
  const { from, substituted } = pickCoachNotificationFrom({
    explicit: process.env.COACH_NOTIFICATION_FROM,
    from: fromAddress(),
    coachTo: coachEmail(),
  });

  if (substituted && !_warnedSelfAddressed) {
    console.warn(
      `[Email] EMAIL_FROM and COACH_EMAIL resolve to the same mailbox, so coach ` +
        `notifications would be self-addressed. Sending them from ${from} instead. ` +
        `Set COACH_NOTIFICATION_FROM to choose a different sender.`
    );
    _warnedSelfAddressed = true;
  }

  return from;
}

// ─── Formatters ─────────────────────────────────────────────────────────────

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── ICS calendar attachment ────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toICSDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Builds an ICS file body for a 1-hour event at the given date/time.
 * `time` is "HH:MM" interpreted as local time (America/Los_Angeles).
 */
function buildICS(opts: {
  uid: string;
  date: string;
  time: string;
  title: string;
  description: string;
  attendeeEmail?: string;
  organizerEmail: string;
}): string {
  const [hours, minutes] = opts.time.split(":").map(Number);
  // Treat as Pacific time. Construct via offset so DST is approximate but fine
  // for ICS — the user's calendar app will display whatever timezone they're in.
  const start = new Date(opts.date + "T" + opts.time + ":00-07:00");
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elek Athletics//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@elekathletics.com`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    `DESCRIPTION:${escapeICS(opts.description)}`,
    `ORGANIZER:mailto:${opts.organizerEmail}`,
  ];
  if (opts.attendeeEmail) {
    lines.push(
      `ATTENDEE;CN=${opts.attendeeEmail};RSVP=TRUE:mailto:${opts.attendeeEmail}`
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

// ─── Email senders ──────────────────────────────────────────────────────────

/**
 * Notify Elek + the client about a free consultation. Includes ICS for both.
 */
export async function sendConsultationEmails(booking: Booking): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const when = `${formatLongDate(booking.date)} @ ${formatTime12h(booking.time)}`;
  const title = `Consult: Elek + ${booking.name}`;
  const description = [
    `Free 15-min consultation.`,
    `Client: ${booking.name} <${booking.email}>${booking.phone ? ` · ${booking.phone}` : ""}`,
    booking.goals ? `Goals: ${booking.goals}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ics = buildICS({
    uid: booking.id,
    date: booking.date,
    time: booking.time,
    title,
    description,
    attendeeEmail: booking.email,
    organizerEmail: coachEmail(),
  });

  const icsAttachment = {
    filename: "consultation.ics",
    content: Buffer.from(ics).toString("base64"),
  };

  // → Coach
  try {
    await resend.emails.send({
      from: coachNotificationFrom(),
      to: coachEmail(),
      subject: `New consult booked: ${booking.name} — ${when}`,
      html: renderEmail({
        preheader: `${booking.name} — ${when}`,
        eyebrow: "New booking",
        heading: "A consult just got booked.",
        lead: `<strong>${escapeHtml(booking.name)}</strong> took the ${when} slot. The calendar invite is attached to this email.`,
        rows: [
          { label: "Name", value: escapeHtml(booking.name) },
          {
            label: "Email",
            value: `<a href="mailto:${escapeHtml(booking.email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(booking.email)}</a>`,
          },
          {
            label: "Phone",
            value: booking.phone
              ? `<a href="tel:${booking.phone.replace(/[^+d]/g, "")}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(booking.phone)}</a>`
              : "&mdash;",
          },
          { label: "When", value: when },
          { label: "Goals", value: escapeHtml(booking.goals ?? "—") },
        ],
        cta: { label: "Open coach dashboard", url: `${coachDashboardUrl()}` },
        footnote: "Reply to this email to reach them directly.",
      }),
      replyTo: booking.email,
      attachments: [icsAttachment],
    });
  } catch (err) {
    console.error("[Email] coach consultation notification failed:", err);
  }

  // → Client
  try {
    await resend.emails.send({
      from: fromAddress(),
      to: booking.email,
      subject: `Your consultation with Elek — ${when}`,
      html: renderEmail({
        preheader: `Your free consult is confirmed for ${when}.`,
        eyebrow: "Consultation confirmed",
        heading: `You're booked, ${escapeHtml(booking.name.split(" ")[0])}.`,
        lead: `Your free 15-minute consultation with Jonny is confirmed. We'll talk through your training history, where you want to get to, and which setup actually fits — no pressure, nothing to pay.`,
        rows: [
          { label: "When", value: `<strong>${when}</strong>` },
          { label: "Length", value: "15 minutes" },
          { label: "Cost", value: "Free" },
        ],
        body: `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#1c1a26;">A calendar invite is attached to this email — open it on your phone or computer to add it to your calendar.</p>`,
        footnote:
          "Need to move it or can't make it? Just reply to this email and we'll find another time.",
      }),
      replyTo: coachEmail(),
      attachments: [icsAttachment],
    });
  } catch (err) {
    console.error("[Email] client consultation confirmation failed:", err);
  }
}

/**
 * Notify Elek of a new contact-form inquiry.
 */
export async function sendInquiryNotification(inquiry: Inquiry): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const topicLabel =
    inquiry.topic === "in-person"
      ? "In-Person"
      : inquiry.topic === "custom"
        ? "Custom Plan"
        : "General";

  const subject = inquiry.subject
    ? `[${topicLabel}] ${inquiry.subject}`
    : `New ${topicLabel.toLowerCase()} inquiry from ${inquiry.name}`;

  try {
    await resend.emails.send({
      from: coachNotificationFrom(),
      to: coachEmail(),
      subject,
      html: renderEmail({
        preheader: `${inquiry.name} — ${topicLabel.toLowerCase()} inquiry`,
        eyebrow: `${topicLabel} inquiry`,
        heading: `${escapeHtml(inquiry.name)} got in touch.`,
        rows: [
          { label: "Name", value: escapeHtml(inquiry.name) },
          {
            label: "Email",
            value: `<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(inquiry.email)}</a>`,
          },
          { label: "Topic", value: escapeHtml(topicLabel) },
          ...(inquiry.subject
            ? [{ label: "Subject", value: escapeHtml(inquiry.subject) }]
            : []),
        ],
        body: `<div style="border-left:3px solid #7c3aed;padding:2px 0 2px 16px;"><p style="margin:0;white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#1c1a26;">${escapeHtml(inquiry.message)}</p></div>`,
        cta: { label: "Open coach dashboard", url: `${coachDashboardUrl()}` },
        footnote: "Reply to this email to answer them directly.",
      }),
      replyTo: inquiry.email,
    });
  } catch (err) {
    console.error("[Email] inquiry notification failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
