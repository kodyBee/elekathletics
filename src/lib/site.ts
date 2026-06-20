export type NavItem = {
  href: string;
  label: string;
};

export const siteConfig = {
  name: "Elek Strength",
  shortName: "Elek",
  tagline: "Train Hard. Move Better. Live Stronger.",
  description:
    "Personal training, online coaching, and performance programming designed around how you actually live.",
  contact: {
    email: "Jon@elekathletics.com",
    phone: "+1 (818) 523-3085",
    location: "Wnrs Circle · Burbank, CA",
    hours: "Mon – Sat · 6:00am – 8:00pm",
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
