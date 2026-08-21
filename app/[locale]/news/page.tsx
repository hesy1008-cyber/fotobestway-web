import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import "@/app/styles/about.css";
import "@/app/styles/news.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News - Fotobestway",
  description:
    "Stay updated with the latest news, product launches, and industry insights from Fotobestway.",
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const newsList = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { publishDate: "desc" }],
  });

  const labels = isZh
    ? {
        news: "新闻资讯",
        heroTitle: "最新动态与行业资讯",
        heroDesc: "了解 Fotobestway 的最新产品发布、公司动态和摄影器材行业趋势",
        browseProducts: "浏览产品",
        allNews: "全部新闻",
        readMore: "阅读全文",
        noNews: "暂无新闻",
        noNewsDesc: "我们正在准备精彩内容，敬请期待...",
        categories: {
          "Company News": "公司新闻",
          "Product Launch": "产品发布",
          "Industry Insights": "行业资讯",
          Event: "活动展会",
          Award: "荣誉奖项",
        },
      }
    : {
        news: "NEWS",
        heroTitle: "Latest News & Industry Insights",
        heroDesc:
          "Stay updated with Fotobestway's latest product launches, company news, and photography equipment industry trends.",
        browseProducts: "BROWSE PRODUCTS",
        allNews: "All News",
        readMore: "Read More",
        noNews: "No News Yet",
        noNewsDesc: "We're preparing exciting content for you. Stay tuned...",
        categories: {
          "Company News": "Company News",
          "Product Launch": "Product Launch",
          "Industry Insights": "Industry Insights",
          Event: "Events",
          Award: "Awards",
        },
      };

  // 按分类分组
  const categories = [...new Set(newsList.map((n) => n.category))];
  const featuredNews = newsList[0];
  const otherNews = newsList.slice(1);

  return (
    <div>
      {/* 顶部 Hero Banner */}
      <section
        className="aboutHero"
        style={{ backgroundImage: `url("/news-hero.jpg")` }}
      >
        <div className="aboutHeroOverlay" />
        <div className="aboutHeroContent">
          <p className="aboutHeroLabel">{labels.news}</p>
          <h1>{labels.heroTitle}</h1>
          <p className="aboutHeroDesc">{labels.heroDesc}</p>
          <Link href={`/${locale}/products`} className="aboutHeroBtn">
            {labels.browseProducts} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* 新闻内容区 */}
      <section className="news-section">
        <div className="news-container">
          {newsList.length === 0 ? (
            <div className="news-empty">
              <div className="news-empty-icon">📰</div>
              <h2>{labels.noNews}</h2>
              <p>{labels.noNewsDesc}</p>
            </div>
          ) : (
            <>
              {/* 精选大图新闻 */}
              {featuredNews && (
                <div className="news-featured">
                  <Link href={`/${locale}/news/${featuredNews.slug}`} className="news-featured-link">
                    <div className="news-featured-image">
                      {featuredNews.coverImage ? (
                        <Image
                          src={featuredNews.coverImage}
                          alt={featuredNews.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="news-featured-placeholder" />
                      )}
                      <div className="news-featured-overlay" />
                    </div>
                    <div className="news-featured-content">
                      <span className="news-category-tag">
                        {labels.categories[featuredNews.category as keyof typeof labels.categories] ||
                          featuredNews.category}
                      </span>
                      <h2 className="news-featured-title">{featuredNews.title}</h2>
                      {featuredNews.summary && (
                        <p className="news-featured-summary">{featuredNews.summary}</p>
                      )}
                      <div className="news-featured-meta">
                        <span>{new Date(featuredNews.publishDate).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</span>
                        <span className="news-read-more">{labels.readMore} →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 其他新闻网格 */}
              {otherNews.length > 0 && (
                <div className="news-grid">
                  {otherNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`/${locale}/news/${news.slug}`}
                      className="news-card"
                    >
                      <div className="news-card-image">
                        {news.coverImage ? (
                          <Image
                            src={news.coverImage}
                            alt={news.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="news-card-placeholder" />
                        )}
                      </div>
                      <div className="news-card-content">
                        <span className="news-category-tag">
                          {labels.categories[news.category as keyof typeof labels.categories] ||
                            news.category}
                        </span>
                        <h3 className="news-card-title">{news.title}</h3>
                        {news.summary && (
                          <p className="news-card-summary">{news.summary}</p>
                        )}
                        <div className="news-card-meta">
                          <span>
                            {new Date(news.publishDate).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
                          </span>
                          <span className="news-read-more">{labels.readMore} →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
