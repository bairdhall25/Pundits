import type { MetadataRoute } from "next";
import { canonicalOrigin, canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [canonicalUrl("/sitemap.xml"), canonicalUrl("/news-sitemap.xml")],
    host: canonicalOrigin(),
  };
}
