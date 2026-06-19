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
    email: "hello@elekstrength.com",
    phone: "+1 (555) 123-4567",
    location: "Downtown Studio · 123 Iron St., Suite 4",
    hours: "Mon – Sat · 6:00am – 8:00pm",
  },
  social: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
  },
} as const;

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/coaching", label: "Coaching" },
  { href: "/about", label: "About & Contact" },
];
