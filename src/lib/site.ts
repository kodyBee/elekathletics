import { availabilityWindows } from "@/lib/availability";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Canonical origin, used for metadataBase, canonical URLs, the sitemap, and
 * structured data. Override with NEXT_PUBLIC_SITE_URL on preview deploys so
 * those all point at the deploy being viewed rather than production.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://elekathletics.com";

export const siteConfig = {
  name: "Elek Strength",
  shortName: "Elek",
  legalName: "Elek Athletics",
  tagline: "Train Hard. Move Better. Live Stronger.",
  description:
    "Personal training, online coaching, and performance programming designed around how you actually live.",
  url: siteUrl,
  priceRange: "$$",
  contact: {
    email: "Jon@elekathletics.com",
    phone: "+1 (818) 523-3085",
    location: "Winner’s Circle · Burbank, CA",
    /**
     * Street address and Google Business Profile are deliberately blank rather
     * than guessed. Fill them in and the LocalBusiness structured data in
     * `components/structured-data.tsx` picks up the postal address
     * automatically — it omits the field while these are empty.
     */
    address: {
      streetAddress: "",
      addressLocality: "Burbank",
      addressRegion: "CA",
      postalCode: "",
      addressCountry: "US",
    },
    googleBusinessProfile: "",
    /** Derived from the bookable slots so the two can never drift apart. */
    hours: {
      weekdays: availabilityWindows.weekdays,
      saturday: availabilityWindows.saturday,
    },
  },
  social: {
    instagram: "https://www.instagram.com/jonnyelek/",
  },
} as const;

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/coaching", label: "Coaching" },
  { href: "/about", label: "About & Contact" },
];
