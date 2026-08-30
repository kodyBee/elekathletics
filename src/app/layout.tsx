import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

import { siteConfig, siteUrl } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const anton = Anton({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elek Athletics — Personal Training & Coaching in Burbank, CA",
    template: "%s · Elek Athletics",
  },
  description:
    "1-on-1 personal training, online coaching, and performance programming in Burbank, CA. Train hard. Recover smart. Move better.",
  applicationName: siteConfig.legalName,
  keywords: [
    "personal trainer Burbank",
    "personal training Los Angeles",
    "online fitness coaching",
    "strength and conditioning coach",
    "bodybuilding coach Burbank",
  ],
  authors: [{ name: "Jonny Elek", url: siteUrl }],
  creator: "Jonny Elek",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.legalName,
    title: "Elek Athletics — Personal Training & Coaching in Burbank, CA",
    description:
      "1-on-1 personal training, online coaching, and performance programming. Book a free 15-minute consult.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elek Athletics — Personal Training & Coaching",
    description:
      "1-on-1 personal training, online coaching, and performance programming in Burbank, CA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${anton.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StructuredData />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
