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
    take: 5,
    orderBy: { publishDate: "desc" },
  });

  // 获取最新新闻（用于侧边栏）
  const latestNews = await prisma.news.findMany({
    where: { isActive: true, id: { not: news.id } },
    take: 5,
    orderBy: { publishDate: "desc" },
  });

  const labels = isZh
    ? {
        backToNews: "返回新闻列表",
        readMore: "阅读全文",
        relatedNews: "相关新闻",
        latestNews: "最新资讯",
        share: "分享",
        followUs: "关注我们",
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
        latestNews: "Latest News",
        share: "Share",
        followUs: "Follow Us",
        categories: {
          "Company News": "Company News",
          "Product Launch": "Product Launch",
          "Industry Insights": "Industry Insights",
          Event: "Events",
          Award: "Awards",
        },
      };

  const sidebarNews = relatedNews.length > 0 ? relatedNews : latestNews;

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

      {/* 正文内容区 - 左右分栏 */}
      <section className="news-detail-section">
        <div className="news-detail-layout">
          {/* 左边：正文内容 */}
          <div className="news-detail-main">
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

          {/* 右边：侧边栏 */}
          <aside className="news-detail-sidebar">
            {/* 查看更多 - 相关/最新新闻 */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">
                {relatedNews.length > 0 ? labels.relatedNews : labels.latestNews}
              </h3>
              <div className="sidebar-news-list">
                {sidebarNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/news/${item.slug}`}
                    className="sidebar-news-item"
                  >
                    {item.coverImage && (
                      <div className="sidebar-news-thumb">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="sidebar-news-info">
                      <h4 className="sidebar-news-title">{item.title}</h4>
                      <span className="sidebar-news-date">
                        {new Date(item.publishDate).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 社媒图标 */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">{labels.followUs}</h3>
              <div className="sidebar-social-icons">
                <a
                  href="https://www.facebook.com/profile.php?id=61561703761081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-social-icon sidebar-social-facebook"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@fotobestwayphotovideo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-social-icon sidebar-social-youtube"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/fotobestway/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-social-icon sidebar-social-instagram"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
