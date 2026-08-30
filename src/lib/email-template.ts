import { siteConfig, siteUrl } from "@/lib/site";

/**
 * Shared chrome for transactional email.
 *
 * Email clients are not browsers: Outlook renders through Word, and Gmail
 * strips <style> blocks and most modern CSS. So this is table-based layout
 * with inline styles only — no flexbox, no grid, no shorthand Outlook
 * mishandles.
 *
 * The brand mark is metallic and nearly invisible on white, so it sits on a
 * dark header band. Images are blocked by default in most clients, which is
 * why the wordmark under it is real text rather than part of the image.
 */

const BRAND = {
  ink: "#0c0a14", // header band — the site background
  // A shade deeper than the site's #9d5bf4: white text on the lighter purple
  // does not carry enough contrast for a filled button.
  purple: "#7c3aed",
  page: "#ebebef",
  card: "#ffffff",
  text: "#1c1a26",
  muted: "#6b6878",
  line: "#e4e3ea",
} as const;

export interface EmailRow {
  label: string;
  /** Pre-escaped HTML. Callers must escape any user-supplied value. */
  value: string;
}

export interface EmailOptions {
  /** Inbox preview line, shown beside the subject. Never rendered in-body. */
  preheader: string;
  eyebrow?: string;
  heading: string;
  /** Pre-escaped HTML. */
  lead?: string;
  rows?: EmailRow[];
  /** Free-form pre-escaped HTML placed under the detail rows. */
  body?: string;
  cta?: { label: string; url: string };
  footnote?: string;
}

function rowsTable(rows: EmailRow[]): string {
  const cells = rows
    .map((r, i) => {
      const divider = i > 0 ? `border-top:1px solid ${BRAND.line};` : "";
      return `
                <tr>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};white-space:nowrap;vertical-align:top;${divider}">${r.label}</td>
                  <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:${BRAND.text};vertical-align:top;${divider}">${r.value}</td>
                </tr>`;
    })
    .join("");

  return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;border:1px solid ${BRAND.line};border-radius:8px;">${cells}
              </table>`;
}

export function renderEmail(opts: EmailOptions): string {
  const { preheader, eyebrow, heading, lead, rows, body, cta, footnote } = opts;
  const tel = siteConfig.contact.phone.replace(/[^+\d]/g, "");

  const eyebrowHtml = eyebrow
    ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.purple};font-weight:bold;padding-bottom:10px;">${eyebrow}</div>`
    : "";

  const leadHtml = lead
    ? `<p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:${BRAND.text};">${lead}</p>`
    : "";

  const rowsHtml =
    rows && rows.length
      ? `<tr><td style="padding:22px 32px 0 32px;">${rowsTable(rows)}</td></tr>`
      : "";

  const bodyHtml = body
    ? `<tr><td style="padding:22px 32px 0 32px;">${body}</td></tr>`
    : "";

  const ctaHtml = cta
    ? `<tr>
          <td style="padding:26px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${BRAND.purple}" style="background-color:${BRAND.purple};border-radius:8px;">
                  <a href="${cta.url}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;">${cta.label}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : "";

  const footnoteHtml = footnote
    ? `<tr><td style="padding:24px 32px 0 32px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:${BRAND.muted};">${footnote}</p></td></tr>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${BRAND.page};">
<div style="display:none;font-size:1px;color:${BRAND.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.page};">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${BRAND.card};border-radius:14px;overflow:hidden;">

        <tr>
          <td align="center" bgcolor="${BRAND.ink}" style="background-color:${BRAND.ink};padding:32px 24px 26px 24px;">
            <img src="${siteUrl}/email-logo.png" width="108" height="96" alt="Elek Athletics" style="display:block;border:0;outline:none;text-decoration:none;width:108px;height:96px;" />
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;letter-spacing:0.22em;text-transform:uppercase;color:#ffffff;padding-top:14px;font-weight:bold;">Elek Athletics</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:#a9a4b9;padding-top:5px;">Train hard &middot; Move better &middot; Live stronger</div>
          </td>
        </tr>
        <tr><td style="height:4px;background-color:${BRAND.purple};font-size:0;line-height:0;">&nbsp;</td></tr>

        <tr>
          <td style="padding:34px 32px 8px 32px;">
            ${eyebrowHtml}
            <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;color:${BRAND.text};font-weight:bold;">${heading}</h1>
            ${leadHtml}
          </td>
        </tr>

        ${rowsHtml}
        ${bodyHtml}
        ${ctaHtml}
        ${footnoteHtml}

        <tr><td style="padding:30px 32px 0 32px;"><div style="height:1px;background-color:${BRAND.line};font-size:0;line-height:0;">&nbsp;</div></td></tr>

        <tr>
          <td style="padding:20px 32px 32px 32px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${BRAND.muted};">
              <strong style="color:${BRAND.text};">Jonny Elek</strong><br />
              Personal trainer &amp; strength coach &middot; ${siteConfig.contact.address.addressLocality}, ${siteConfig.contact.address.addressRegion}<br />
              <a href="mailto:${siteConfig.contact.email}" style="color:${BRAND.purple};text-decoration:none;">${siteConfig.contact.email}</a>
              &nbsp;&middot;&nbsp;
              <a href="tel:${tel}" style="color:${BRAND.purple};text-decoration:none;">${siteConfig.contact.phone}</a>
            </p>
            <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">
              <a href="${siteUrl}" style="color:${BRAND.muted};text-decoration:underline;">elekathletics.com</a>
              &nbsp;&middot;&nbsp;
              <a href="${siteConfig.social.instagram}" style="color:${BRAND.muted};text-decoration:underline;">Instagram</a>
            </p>
          </td>
        </tr>

      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}
