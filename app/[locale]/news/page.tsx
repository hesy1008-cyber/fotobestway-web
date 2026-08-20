import Link from "next/link";

export const metadata = {
  title: "News - Fotobestway",
  description: "Stay updated with the latest news, product launches, and industry insights from Fotobestway.",
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const labels = isZh
    ? {
        news: "新闻资讯",
        heroTitle: "最新动态与行业资讯",
        heroDesc: "了解 Fotobestway 的最新产品发布、公司动态和摄影器材行业趋势",
        browseProducts: "浏览产品",
        comingSoon: "即将推出",
        comingSoonDesc: "我们正在准备精彩内容，敬请期待...",
        stayUpdated: "保持关注",
        stayUpdatedDesc: "订阅我们的通讯，第一时间获取最新产品资讯和行业动态",
        contactUs: "联系我们",
        needInfo: "需要了解更多？",
        needInfoDesc: "如果您想了解我们的产品或有任何疑问，欢迎随时联系我们的团队",
      }
    : {
        news: "NEWS",
        heroTitle: "Latest News & Industry Insights",
        heroDesc: "Stay updated with Fotobestway's latest product launches, company news, and photography equipment industry trends.",
        browseProducts: "BROWSE PRODUCTS",
        comingSoon: "Coming Soon",
        comingSoonDesc: "We're preparing exciting content for you. Stay tuned...",
        stayUpdated: "Stay Updated",
        stayUpdatedDesc: "Subscribe to our newsletter to get the latest product news and industry updates delivered to your inbox.",
        contactUs: "CONTACT US",
        needInfo: "Need More Information?",
        needInfoDesc: "If you'd like to learn more about our products or have any questions, feel free to reach out to our team anytime.",
      };

  return (
    <div className="support-page">
      {/* Hero Section */}
      <section className="support-hero">
        <div className="support-hero-bg"></div>
        <div className="support-hero-content">
          <p className="support-hero-label">{labels.news}</p>
          <h1 className="support-hero-title">{labels.heroTitle}</h1>
          <p className="support-hero-desc">{labels.heroDesc}</p>
          <div className="support-hero-actions">
            <Link href={`/${locale}/products`} className="support-hero-btn primary">
              {labels.browseProducts}
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon Placeholder */}
      <section className="support-section">
        <div className="support-container">
          <div className="coming-soon-placeholder">
            <div className="coming-soon-icon">📰</div>
            <h2 className="coming-soon-title">{labels.comingSoon}</h2>
            <p className="coming-soon-desc">{labels.comingSoonDesc}</p>
          </div>
        </div>
      </section>

      {/* Stay Updated Section */}
      <section className="support-section alt-bg">
        <div className="support-container">
          <div className="support-info-card">
            <div className="support-info-icon">✉️</div>
            <h3 className="support-info-title">{labels.stayUpdated}</h3>
            <p className="support-info-desc">{labels.stayUpdatedDesc}</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="support-bottom-cta">
        <div className="support-container">
          <h2 className="support-bottom-title">{labels.needInfo}</h2>
          <p className="support-bottom-desc">{labels.needInfoDesc}</p>
          <Link href={`/${locale}/contact`} className="support-bottom-btn">
            {labels.contactUs}
          </Link>
        </div>
      </section>
    </div>
  );
}
