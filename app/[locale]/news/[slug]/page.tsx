import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import "@/app/styles/about.css";
import "@/app/styles/news.css";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isZh = locale === "zh";

  const news = await prisma.news.findUnique({ where: { slug } });

  if (!news || !news.isActive) {
    notFound();
  }

  // 获取相关新闻（同分类的其他新闻）
  const relatedNews = await prisma.news.findMany({
    where: {
      isActive: true,
      category: news.category,
      id: { not: news.id },
    },
    take: 3,
    orderBy: { publishDate: "desc" },
  });

  const labels = isZh
    ? {
        backToNews: "返回新闻列表",
        readMore: "阅读全文",
        relatedNews: "相关新闻",
        categories: {
          "Company News": "公司新闻",
          "Product Launch": "产品发布",
          "Industry Insights": "行业资讯",
          Event: "活动展会",
          Award: "荣誉奖项",
        },
      }
    : {
        backToNews: "Back to News",
        readMore: "Read More",
        relatedNews: "Related News",
        categories: {
          "Company News": "Company News",
          "Product Launch": "Product Launch",
          "Industry Insights": "Industry Insights",
          Event: "Events",
          Award: "Awards",
        },
      };

  return (
    <div>
      {/* 顶部封面图 */}
      <section className="news-detail-hero">
        {news.coverImage ? (
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="news-detail-hero-placeholder" />
        )}
        <div className="news-detail-hero-overlay" />
        <div className="news-detail-hero-content">
          <Link href={`/${locale}/news`} className="news-detail-back">
            ← {labels.backToNews}
          </Link>
          <span className="news-category-tag news-category-tag-large">
            {labels.categories[news.category as keyof typeof labels.categories] || news.category}
          </span>
          <h1 className="news-detail-title">{news.title}</h1>
          <div className="news-detail-meta">
            <span>{new Date(news.publishDate).toLocaleDateString(isZh ? "zh-CN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </section>

      {/* 正文内容 */}
      <section className="news-detail-section">
        <div className="news-detail-container">
          {news.summary && (
            <p className="news-detail-summary">{news.summary}</p>
          )}
          {news.content ? (
            <div
              className="news-detail-content"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          ) : (
            <p className="news-detail-empty">内容待补充...</p>
          )}
        </div>
      </section>

      {/* 相关新闻 */}
      {relatedNews.length > 0 && (
        <section className="news-related-section">
          <div className="news-container">
            <h2 className="news-related-title">{labels.relatedNews}</h2>
            <div className="news-grid">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/news/${item.slug}`}
                  className="news-card"
                >
                  <div className="news-card-image">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="news-card-placeholder" />
                    )}
                  </div>
                  <div className="news-card-content">
                    <span className="news-category-tag">
                      {labels.categories[item.category as keyof typeof labels.categories] ||
                        item.category}
                    </span>
                    <h3 className="news-card-title">{item.title}</h3>
                    {item.summary && (
                      <p className="news-card-summary">{item.summary}</p>
                    )}
                    <div className="news-card-meta">
                      <span>
                        {new Date(item.publishDate).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
                      </span>
                      <span className="news-read-more">{labels.readMore} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
