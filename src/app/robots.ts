import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The coach dashboard is auth-gated; the rest is either an API surface
      // or a one-time post-checkout page with nothing to index.
      disallow: ["/api/", "/coach", "/coaching/success"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
