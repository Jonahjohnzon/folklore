// app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://tipatale.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",     // backend routes, nothing to index
          "/sign-up",
          "/settings",
          "/settings/*",
          "/write",
          "/write/*",
          "/verify-email",
          "/u",
          "/u/*",
          "/library",
          "/history",
          "/notifications",
          "/dashboard",
          "/verify-email/*",
          "/coins",
          "/admin",    // the /admin page itself
          "/admin/*",  // everything nested under /admin
          "/*?*",      // avoid indexing querystring variants (pagination, filters, etc.)
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}