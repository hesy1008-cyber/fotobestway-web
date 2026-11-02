import type { MetadataRoute } from "next";

const baseUrl =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://fotobestway.com.cn";

// 无商业价值的 AI 训练爬虫：禁止整站抓取，降低无效带宽消耗
// （合规爬虫会遵守 robots；不遵守的扫描器由 nginx 层 444 兜底）
const blockedAiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "CCBot",
  "Bytespider",
  "Google-Extended",
  "PerplexityBot",
  "Amazonbot",
  "ElevenlabsCrawler",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: blockedAiBots,
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
