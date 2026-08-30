import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt =
  "Elek Athletics — personal training and online coaching in Burbank, CA";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

// Brand tokens from globals.css, resolved out of oklch() because Satori only
// understands sRGB colours.
const BACKGROUND = "#0c0a14";
const PRIMARY = "#9d5bf4";
const FOREGROUND = "#f2f1f8";
const MUTED = "#a9a4b9";

export default async function Image() {
  const [anton, roboto] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Anton-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/RobotoCondensed-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: BACKGROUND,
          backgroundImage: `radial-gradient(circle at 78% 12%, ${PRIMARY}38 0%, ${BACKGROUND}00 55%)`,
          fontFamily: "Roboto Condensed",
          color: FOREGROUND,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: "Anton",
              fontSize: 30,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Elek Athletics
          </span>
          <span style={{ color: PRIMARY, fontSize: 38, lineHeight: 1 }}>•</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Anton",
            fontSize: 106,
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          <span>Train hard.</span>
          <span style={{ color: PRIMARY }}>Move better.</span>
          <span>Live stronger.</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            color: MUTED,
          }}
        >
          <span>1-on-1 training · Online coaching · Nutrition</span>
          <span style={{ color: FOREGROUND }}>
            {siteConfig.contact.address.addressLocality},{" "}
            {siteConfig.contact.address.addressRegion}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, style: "normal", weight: 400 },
        { name: "Roboto Condensed", data: roboto, style: "normal", weight: 500 },
      ],
    }
  );
}
