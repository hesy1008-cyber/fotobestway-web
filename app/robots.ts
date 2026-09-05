import type { MetadataRoute } from "next";

const baseUrl =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://fotobestway.com.cn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
