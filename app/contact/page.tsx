import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us - Fotobestway",
  description: "Contact Fotobestway for professional photography lighting equipment solutions, OEM/ODM services, and product inquiries.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; type?: string; products?: string; count?: string; inquiry?: string }>;
}) {
  const params = await searchParams;
  const productSlug = params.product;
  const inquiryType = params.type;
  const productsParam = params.products;
  const inquiryMode = params.inquiry === "1";

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
          <div className="contactHeroLabel">CONTACT US</div>
          <h1>Let's Work Together</h1>
          <p>
            Get in touch with our team for product information, custom solutions,
            and wholesale inquiries. We respond within 24 business hours.
          </p>
          <a href="mailto:maggie@fotobestway.com.cn" className="contactHeroBtn">
            EMAIL US NOW
          </a>
        </div>
      </section>

      {/* Contact Main - 左右布局：表单 + 信息 */}
      <section className="contactMain">
        <div className="contactContainer">
          {/* Contact Form */}
          <div className="contactFormCard">
            <h2>Send Us a Message</h2>
            <p className="contactSubtitle">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
            <ContactForm
              initialSubject={inquiryType === "inquiry" || inquiryMode ? "product-inquiry" : undefined}
              initialProduct={productName}
              initialMessage={initialMessage}
            />
          </div>

          {/* Contact Info */}
          <div className="contactInfoCard">
            <h2>Get in Touch</h2>

            <div className="contactInfoList">
              <div className="contactInfoItem">
                <div className="infoNumber">01</div>
                <div>
                  <h3>Email</h3>
                  <p>
                    <a href="mailto:maggie@fotobestway.com.cn">maggie@fotobestway.com.cn</a>
                  </p>
                  <p className="infoSub">Sales & General Inquiries</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">02</div>
                <div>
                  <h3>Phone & WeChat</h3>
                  <p>Tel: +86 574 6270 7558</p>
                  <p>Mobile: +86 135 6782 6336</p>
                  <p className="infoSub">WeChat / WhatsApp available</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">03</div>
                <div>
                  <h3>Factory Address</h3>
                  <p>22 Xingye Road, Yangming Industry Zone</p>
                  <p>Yuyao, Zhejiang, P.R. China</p>
                  <p className="infoSub">Visits by appointment</p>
                </div>
              </div>

              <div className="contactInfoItem">
                <div className="infoNumber">04</div>
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 12:00 PM</p>
                  <p className="infoSub">China Standard Time (UTC+8)</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="contactQuickLinks">
              <h3>Quick Links</h3>
              <div className="quickLinkGrid">
                <Link href="/products" className="quickLinkItem">
                  Browse Products
                </Link>
                <Link href="/support" className="quickLinkItem">
                  Support Center
                </Link>
                <Link href="/about" className="quickLinkItem">
                  About Us
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
            <h2>Why Choose Fotobestway</h2>
            <p>Professional photography equipment manufacturer with 15+ years of experience</p>
          </div>

          <div className="whyUsGrid">
            <div className="whyUsCard">
              <div className="whyUsNumber">01</div>
              <h3>OEM / ODM Service</h3>
              <p>Full customization from design to production, tailored to your brand requirements</p>
              <Link href="/products" className="whyUsBtn">Learn More</Link>
            </div>

            <div className="whyUsCard">
              <div className="whyUsNumber">02</div>
              <h3>Factory Direct Pricing</h3>
              <p>Competitive wholesale prices with no middlemen, saving you 30-50% on costs</p>
              <a href="mailto:maggie@fotobestway.com.cn" className="whyUsBtn">Get Quote</a>
            </div>

            <div className="whyUsCard">
              <div className="whyUsNumber">03</div>
              <h3>Quality Guaranteed</h3>
              <p>2-year warranty on all products, strict QC process, CE & RoHS certified</p>
              <Link href="/support" className="whyUsBtn">Warranty Info</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA - 纯黑背景，与 Support 页统一 */}
      <section className="contactBottomCTA">
        <div className="bottomCTAContent">
          <h2>Ready to Start Your Project?</h2>
          <p>
            Whether you need standard products or custom OEM/ODM solutions,
            our team is here to help.
          </p>
          <a href="mailto:maggie@fotobestway.com.cn" className="bottomCTABtn">
            GET A FREE QUOTE
          </a>
        </div>
      </section>
    </main>
  );
}
