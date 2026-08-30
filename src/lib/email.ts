import { Resend } from "resend";
import { siteConfig } from "./site";
import type { Booking } from "./bookings";
import type { Inquiry } from "./inquiries";

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

function fromAddress(): string {
  // Resend requires either onboarding@resend.dev (sandbox) or a verified domain.
  return process.env.EMAIL_FROM || "Elek Athletics <onboarding@resend.dev>";
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
 * Notify Elek that a paid client signed up. Trainerize entry is manual.
 */
export async function sendPaidBookingNotification(booking: Booking): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const subject = `New paid client: ${booking.name} (${booking.package})`;
  const html = `
    <h2>New paid client</h2>
    <p>Stripe confirmed payment. Add them to Trainerize when you're ready.</p>
    <table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(booking.name)}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(booking.phone ?? "—")}</td></tr>
      <tr><td><strong>Package</strong></td><td>${escapeHtml(booking.package)}</td></tr>
      <tr><td><strong>Requested date</strong></td><td>${formatLongDate(booking.date)} @ ${formatTime12h(booking.time)}</td></tr>
      <tr><td><strong>Goals</strong></td><td>${escapeHtml(booking.goals ?? "—")}</td></tr>
    </table>
  `;

  try {
    await resend.emails.send({
      from: fromAddress(),
      to: coachEmail(),
      subject,
      html,
      replyTo: booking.email,
    });
  } catch (err) {
    console.error("[Email] paid booking notification failed:", err);
  }
}

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
      from: fromAddress(),
      to: coachEmail(),
      subject: `New consult booked: ${booking.name} — ${when}`,
      html: `
        <h2>New consultation booked</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(booking.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a></td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(booking.phone ?? "—")}</td></tr>
          <tr><td><strong>When</strong></td><td>${when}</td></tr>
          <tr><td><strong>Goals</strong></td><td>${escapeHtml(booking.goals ?? "—")}</td></tr>
        </table>
        <p>Calendar invite attached.</p>
      `,
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
      html: `
        <p>Hey ${escapeHtml(booking.name.split(" ")[0])},</p>
        <p>Your free 15-minute consultation with Elek is confirmed for <strong>${when}</strong>.</p>
        <p>Calendar invite attached — open it on your phone or computer to add it to your calendar.</p>
        <p>Talk soon,<br/>Elek Athletics</p>
      `,
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
      from: fromAddress(),
      to: coachEmail(),
      subject,
      html: `
        <h2>New inquiry — ${escapeHtml(topicLabel)}</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(inquiry.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></td></tr>
          ${inquiry.subject ? `<tr><td><strong>Subject</strong></td><td>${escapeHtml(inquiry.subject)}</td></tr>` : ""}
        </table>
        <p style="white-space:pre-wrap;margin-top:16px;">${escapeHtml(inquiry.message)}</p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Manage in the <a href="${process.env.BASE_URL || "http://localhost:3000"}/coach">coach dashboard</a>.</p>
      `,
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
