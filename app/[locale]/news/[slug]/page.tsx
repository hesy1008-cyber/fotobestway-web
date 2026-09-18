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
        contactUs: "联系我们",
        contactEmail: "邮箱",
        contactPhone: "电话",
        contactWhatsApp: "WhatsApp",
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
        contactUs: "Contact Us",
        contactEmail: "Email",
        contactPhone: "Phone",
        contactWhatsApp: "WhatsApp",
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

            {/* 联系方式 */}
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">{labels.contactUs}</h3>
              <div className="sidebar-contact-list">
                <a href="mailto:maggie@fotobestway.com.cn" className="sidebar-contact-item">
                  <span className="sidebar-contact-icon sidebar-contact-email">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 6L2 7" />
                    </svg>
                  </span>
                  <div className="sidebar-contact-info">
                    <span className="sidebar-contact-label">{labels.contactEmail}</span>
                    <span className="sidebar-contact-value">maggie@fotobestway.com.cn</span>
                  </div>
                </a>
                <a href="tel:+8613567826336" className="sidebar-contact-item">
                  <span className="sidebar-contact-icon sidebar-contact-phone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div className="sidebar-contact-info">
                    <span className="sidebar-contact-label">{labels.contactPhone}</span>
                    <span className="sidebar-contact-value">+86 135 6782 6336</span>
                  </div>
                </a>
                <a href="https://wa.me/8613567826336" target="_blank" rel="noopener noreferrer" className="sidebar-contact-item">
                  <span className="sidebar-contact-icon sidebar-contact-whatsapp">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </span>
                  <div className="sidebar-contact-info">
                    <span className="sidebar-contact-label">{labels.contactWhatsApp}</span>
                    <span className="sidebar-contact-value">+86 135 6782 6336</span>
                  </div>
                </a>
              </div>
            </div>

            <Link href={`/${locale}/news`} className="sidebar-back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {labels.backToNews}
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
