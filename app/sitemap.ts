import type { MetadataRoute } from "next";
import { prisma } from "@/app/lib/prisma";

// 站点域名：优先读环境变量 SITE_URL，否则用占位域名
// 上线后请在 .env 里设置 SITE_URL=https://你的正式域名
const baseUrl =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://fotobestway.com.cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/support`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, createdAt: true },
    });
    productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    // 数据库不可用时仅返回静态页
  }

  return [...staticPages, ...productPages];
}
