import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * Only the pages a prospect should land on from search. The coach dashboard,
 * the API, and the post-checkout success/cancel pages are left out — they're
 * also disallowed in `robots.ts`.
 */
const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/coaching", changeFrequency: "monthly", priority: 0.9 },
  { path: "/coaching/custom", changeFrequency: "monthly", priority: 0.8 },
  { path: "/coaching/in-person", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
