import Link from "next/link";
import FAQAccordion from "./FAQAccordion";
import { prisma } from "@/app/lib/prisma";

export const metadata = {
  title: "Support Center - Fotobestway",
  description: "Find answers to frequently asked questions, download product manuals, and learn about our warranty and after-sales support policies.",
};

const faqData = [
  {
    question: "What is the warranty period for Fotobestway products?",
    answer:
      "All Fotobestway products come with a standard 2-year manufacturer warranty. Extended warranty options are available for bulk orders and OEM/ODM partners. The warranty covers manufacturing defects and faulty components. Consumable parts (such as bulbs, filters, and fabrics) are covered for 90 days from the date of purchase.",
  },
  {
    question: "How do I get technical support for my product?",
    answer:
      "You can reach our technical support team via email at info@fotobestway.com.cn or through the contact form on this page. Our support team is available Monday through Friday, 9:00 AM to 6:00 PM (China Standard Time). For urgent issues, please include your order number, product model, and a detailed description of the problem along with photos or videos if possible.",
  },
  {
    question: "Can I get replacement parts for my equipment?",
    answer:
      "Yes, we offer a full range of replacement parts for all our products. Common replacement parts include light bulbs, diffuser panels, mounting brackets, cables, and control boards. Please contact our support team with your product model and the specific part you need, and we'll provide pricing and availability information.",
  },
  {
    question: "Do you offer OEM/ODM customization services?",
    answer:
      "Absolutely! We provide comprehensive OEM/ODM services for brands, distributors, and retailers worldwide. Our customization capabilities include custom branding (logo printing, packaging design), product specification adjustments, color customization, and fully custom product development. Minimum order quantities apply for custom orders — please contact our sales team for details.",
  },
  {
    question: "What is the typical lead time for orders?",
    answer:
      "For standard products in stock, orders typically ship within 3-5 business days. For bulk orders or custom OEM/ODM orders, lead times vary depending on order quantity and customization requirements — usually 30-60 days. Our sales team will provide you with a detailed production schedule after confirming your order details.",
  },
  {
    question: "How do I become a Fotobestway distributor?",
    answer:
      "We're always looking for new distribution partners! To apply, please contact our sales team at maggie@fotobestway.com.cn with information about your company, target market, and estimated annual sales volume. We offer competitive wholesale pricing, marketing support, and exclusive territory options for qualified distributors.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept T/T (Telegraphic Transfer), L/C (Letter of Credit), and PayPal for sample orders. For large orders, we typically require a 30% deposit with the balance due before shipment. Custom payment terms can be negotiated for established partners.",
  },
  {
    question: "Do you provide product training or installation support?",
    answer:
      "Yes, we offer comprehensive product training for our distributors and OEM partners. This includes product knowledge training, installation guidance, and troubleshooting workshops. Training can be conducted online or on-site at our factory. We also provide detailed user manuals and video tutorials for all our products.",
  },
];

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function SupportPage() {
  // 从数据库读取启用的分类
  const categories = await prisma.pdfCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      files: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  // 转换格式
  const downloadCategories = categories.map((cat) => ({
    key: cat.id,
    title: cat.name,
    subtitle: cat.subtitle || cat.slug.toUpperCase(),
    items: cat.files.map((pdf) => ({
      id: pdf.id,
      name: pdf.title,
      size: formatFileSize(pdf.fileSize),
      format: "PDF",
      url: pdf.fileUrl,
    })),
  }));
  return (
    <main className="supportPage">
      {/* Hero Section */}
      <section
        className="supportHero"
        style={{
          backgroundImage: "url(/studio3.jpg)",
        }}
      >
        <div className="supportHeroOverlay"></div>
        <div className="supportHeroContent">
          <div className="supportHeroLabel">SUPPORT CENTER</div>
          <h1>We're Here to Help</h1>
          <p>
            Find answers, download resources, and get expert support for your
            Fotobestway professional equipment.
          </p>
          <Link href="/contact" className="supportHeroBtn">
            CONTACT SUPPORT
          </Link>
        </div>
      </section>

      {/* Downloads Section - 排第一 */}
      <section className="supportDownloads">
        <div className="supportSectionHeader">
          <h2>Download Center</h2>
          <p>Access product manuals, spec sheets, and marketing resources</p>
        </div>

        <div className="downloadsGrid">
          {downloadCategories.map((category) => (
            <div key={category.key} className="downloadCategory">
              <div className="downloadCategoryHeader">
                <div className="downloadCategorySubtitle">{category.subtitle}</div>
                <h3>{category.title}</h3>
              </div>

              <div className="downloadItems">
                {category.items.map((item) => (
                  <div key={item.id} className="downloadItem">
                    <div className="downloadItemInfo">
                      <span className="downloadItemName">{item.name}</span>
                      <span className="downloadItemMeta">
                        {item.format} · {item.size}
                      </span>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="downloadBtn"
                    >
                      DOWNLOAD
                    </a>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <p style={{ color: "#999", fontSize: "14px", padding: "10px 0" }}>
                    Coming soon...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="downloadNote">
          <p>
            Need a specific document you don't see here?{" "}
            <Link href="/contact">Contact our team</Link> and we'll get it to you right away.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="supportFAQ">
        <div className="supportSectionHeader">
          <h2>Frequently Asked Questions</h2>
          <p>Find quick answers to common questions about our products and services</p>
        </div>

        <div className="faqContainer">
          <FAQAccordion items={faqData} />
        </div>
      </section>

      {/* Quick Support Options - 放在 FAQ 后面 */}
      <section className="supportQuickOptions">
        <div className="supportSectionHeader">
          <h2>Quick Support Options</h2>
          <p>Choose the support channel that works best for you</p>
        </div>

        <div className="supportOptionsGrid">
          <Link href="/contact" className="supportOptionCard">
            <div className="optionNumber">01</div>
            <h3>Email Support</h3>
            <p>Get personalized help from our technical support team</p>
            <span className="optionBtn">Contact Us</span>
          </Link>

          <a href="mailto:info@fotobestway.com.cn" className="supportOptionCard">
            <div className="optionNumber">02</div>
            <h3>Quick Response</h3>
            <p>Response within 24 hours on business days</p>
            <span className="optionBtn">Send Email</span>
          </a>

          <Link href="/products" className="supportOptionCard">
            <div className="optionNumber">03</div>
            <h3>Product Info</h3>
            <p>Find detailed specs for all our products</p>
            <span className="optionBtn">Browse Products</span>
          </Link>
        </div>
      </section>

      {/* Warranty Section */}
      <section className="supportWarranty">
        <div className="warrantyContent">
          <div className="warrantyText">
            <h2>Quality You Can Trust</h2>
            <p className="warrantyDesc">
              Every Fotobestway product is built to professional standards and backed by
              our comprehensive warranty and support program.
            </p>

            <div className="warrantyFeatures">
              <div className="warrantyFeature">
                <div className="warrantyIcon">01</div>
                <div>
                  <h4>2-Year Standard Warranty</h4>
                  <p>Coverage for all manufacturing defects</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">02</div>
                <div>
                  <h4>90-Day Consumable Coverage</h4>
                  <p>Bulbs, filters, and fabric parts included</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">03</div>
                <div>
                  <h4>Extended Warranty Options</h4>
                  <p>Available for bulk and OEM orders</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">04</div>
                <div>
                  <h4>Global Parts Support</h4>
                  <p>Replacement parts shipped worldwide</p>
                </div>
              </div>
            </div>
          </div>

          <div className="warrantyCTA">
            <h3>Need Warranty Service?</h3>
            <p>
              Contact our support team with your order number and product details,
              and we'll guide you through the warranty process.
            </p>
            <Link href="/contact" className="warrantyBtn">
              START A WARRANTY CLAIM
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="supportBottomCTA">
        <div className="bottomCTAContent">
          <h2>Still Have Questions?</h2>
          <p>
            Our support team is here to help. Reach out and we'll get back to you
            within 24 business hours.
          </p>
          <Link href="/contact" className="bottomCTABtn">
            CONTACT US
          </Link>
        </div>
      </section>
    </main>
  );
}
