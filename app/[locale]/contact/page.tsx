import Link from "next/link";
import ContactForm from "./ContactForm";
import { getMessages } from "@/app/i18n/messages";
import { type Locale } from "@/app/i18n/config";

export const metadata = {
  title: "Contact Us - Fotobestway",
  description: "Contact Fotobestway for professional photography lighting equipment solutions, OEM/ODM services, and product inquiries.",
};

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; type?: string; products?: string; count?: string; inquiry?: string }>;
}) {
  const { locale } = await params;
  const t = getMessages(locale as Locale);
  const paramsData = await searchParams;
  const productSlug = paramsData.product;
  const inquiryType = paramsData.type;
  const productsParam = paramsData.products;
  const inquiryMode = paramsData.inquiry === "1";

  // 根据 slug 生成显示名称（把 slug 转成标题格式）
  const productName = productSlug
    ? productSlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  // 批量询盘的初始 message
  const initialMessage = inquiryMode && productsParam
    ? `I'm interested in the following products:\n\n${productsParam
        .split(" | ")
        .map((p, i) => `${i + 1}. ${p}`)
        .join("\n")}\n\nPlease send me more information and pricing.`
    : productName
    ? `I'm interested in: ${productName}\n\nPlease send me more information about this product.`
    : "";

  return (
    <main className="contactPage">
      {/* Hero Section - 与 Support 页统一 */}
      <section
        className="contactHero"
        style={{
          backgroundImage: "url(/studio.jpg)",
        }}
      >
        <div className="contactHeroOverlay"></div>
        <div className="contactHeroContent">
          <div className="contactHeroLabel">{t.contact.heroLabel}</div>
          <h1>{t.contact.heroTitle}</h1>
          <p>
            {t.contact.heroDesc}
          </p>
          <a href="mailto:maggie@fotobestway.com.cn" className="contactHeroBtn">
            {t.contact.heroBtn}
          </a>
        </div>
      </section>

      {/* Contact Main - 左右布局：表单 + 信息 */}
      <section className="contactMain">
        <div className="contactContainer">
          {/* Contact Form */}
          <div className="contactFormCard">
            <h2>{t.contact.formTitle}</h2>
            <p className="contactSubtitle">
              {t.contact.formSubtitle}
            </p>
            <ContactForm
              initialSubject={inquiryType === "inquiry" || inquiryMode ? "product-inquiry" : undefined}
              initialProduct={productName}
              initialMessage={initialMessage}
              locale={locale}
            />
          </div>

          {/* Contact Info */}
          <div className="contactInfoCard">
            <h2>{t.contact.infoTitle}</h2>

            <div className="contactInfoList">
              <div className="contactInfoItem">
                <div className="infoNumber">01</div>
                <div>
                  <h3>{t.contact.emailTitle}</h3>
                  <p>
                    <a href="mailto:maggie@fotobestway.com.cn">maggie@fotobestway.com.cn</a>
                  </p>
                  <p className="infoSub">{t.contact.emailSub}</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">02</div>
                <div>
                  <h3>{t.contact.phoneTitle}</h3>
                  <p>Tel: +86 574 6270 7558</p>
                  <p>Mobile: +86 135 6782 6336</p>
                  <p className="infoSub">{t.contact.phoneSub}</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">03</div>
                <div>
                  <h3>{t.contact.addressTitle}</h3>
                  <p>{t.contact.addressLine1}</p>
                  <p>{t.contact.addressLine2}</p>
                  <p className="infoSub">{t.contact.addressSub}</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">04</div>
                <div>
                  <h3>{t.contact.hoursTitle}</h3>
                  <p>{t.contact.hoursLine1}</p>
                  <p>{t.contact.hoursLine2}</p>
                  <p className="infoSub">{t.contact.hoursSub}</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="contactQuickLinks">
              <h3>{t.contact.quickLinksTitle}</h3>
              <div className="quickLinkGrid">
                <Link href={`/${locale}/products`} className="quickLinkItem">
                  {t.contact.browseProducts}
                </Link>
                <Link href={`/${locale}/support`} className="quickLinkItem">
                  {t.contact.supportCenter}
                </Link>
                <Link href={`/${locale}/about`} className="quickLinkItem">
                  {t.contact.aboutUs}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - 三个卡片，与 Support 页风格统一 */}
      <section className="contactWhyUs">
        <div className="whyUsContainer">
          <div className="sectionHeader">
            <h2>{t.contact.whyUsTitle}</h2>
            <p>{t.contact.whyUsSubtitle}</p>
          </div>

          <div className="whyUsGrid">
            <div className="whyUsCard">
              <div className="whyUsNumber">01</div>
              <h3>{t.contact.why1Title}</h3>
              <p>{t.contact.why1Desc}</p>
              <Link href={`/${locale}/products`} className="whyUsBtn">{t.contact.learnMore}</Link>
            </div>

            <div className="whyUsCard">
              <div className="whyUsNumber">02</div>
              <h3>{t.contact.why2Title}</h3>
              <p>{t.contact.why2Desc}</p>
              <a href="mailto:maggie@fotobestway.com.cn" className="whyUsBtn">{t.contact.getQuote}</a>
            </div>

            <div className="whyUsCard">
              <div className="whyUsNumber">03</div>
              <h3>{t.contact.why3Title}</h3>
              <p>{t.contact.why3Desc}</p>
              <Link href={`/${locale}/support`} className="whyUsBtn">{t.contact.warrantyInfo}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA - 纯黑背景，与 Support 页统一 */}
      <section className="contactBottomCTA">
        <div className="bottomCTAContent">
          <h2>{t.contact.ctaTitle}</h2>
          <p>
            {t.contact.ctaDesc}
          </p>
          <a href="mailto:maggie@fotobestway.com.cn" className="bottomCTABtn">
            {t.contact.ctaBtn}
          </a>
        </div>
      </section>
    </main>
  );
}
