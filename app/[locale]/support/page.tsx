import Link from "next/link";
import FAQAccordion from "./FAQAccordion";
import { prisma } from "@/app/lib/prisma";
import { translateText } from "@/app/lib/translate";

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

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  // 中文时翻译FAQ
  let translatedFaq = faqData;
  if (isZh) {
    translatedFaq = await Promise.all(
      faqData.map(async (item) => ({
        question: await translateText(item.question),
        answer: await translateText(item.answer),
      }))
    );
  }

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

  // 转换格式，中文时翻译分类名和文件名
  let downloadCategories = categories.map((cat) => ({
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

  if (isZh) {
    downloadCategories = await Promise.all(
      downloadCategories.map(async (cat) => ({
        ...cat,
        title: await translateText(cat.title),
        items: await Promise.all(
          cat.items.map(async (item) => ({
            ...item,
            name: await translateText(item.name),
          }))
        ),
      }))
    );
  }

  // 中文标签
  const labels = isZh ? {
    supportCenter: "支持中心",
    heroTitle: "我们随时为您提供帮助",
    heroDesc: "为您的 Fotobestway 专业设备查找答案、下载资源并获取专家支持",
    contactSupport: "联系支持",
    downloadCenter: "下载中心",
    downloadDesc: "获取产品手册、规格表和营销资料",
    download: "下载",
    comingSoon: "即将推出...",
    downloadNote: "需要这里没有的特定文档？",
    contactTeam: "联系我们的团队",
    downloadNote2: "我们会尽快为您提供",
    faqTitle: "常见问题",
    faqDesc: "查找关于我们产品和服务的常见问题的快速答案",
    quickOptions: "快速支持选项",
    quickOptionsDesc: "选择最适合您的支持渠道",
    emailSupport: "邮件支持",
    emailSupportDesc: "从我们的技术支持团队获取个性化帮助",
    contactUs: "联系我们",
    quickResponse: "快速响应",
    quickResponseDesc: "工作日24小时内回复",
    sendEmail: "发送邮件",
    productInfo: "产品信息",
    productInfoDesc: "查找我们所有产品的详细规格",
    browseProducts: "浏览产品",
    qualityTrust: "值得信赖的品质",
    qualityDesc: "每一款 Fotobestway 产品均按照专业标准制造，并提供全面的保修和支持计划",
    warranty2: "2年标准保修",
    warranty2Desc: "覆盖所有制造缺陷",
    consumable90: "90天耗材保修",
    consumable90Desc: "包括灯泡、滤镜和布料部件",
    extendedWarranty: "延长保修选项",
    extendedWarrantyDesc: "适用于批量和OEM订单",
    globalParts: "全球配件支持",
    globalPartsDesc: "更换配件全球发货",
    needWarranty: "需要保修服务？",
    needWarrantyDesc: "联系我们的支持团队，提供您的订单号和产品详情，我们将指导您完成保修流程",
    startClaim: "开始保修申请",
    stillQuestions: "还有问题？",
    stillQuestionsDesc: "我们的支持团队随时为您提供帮助。联系我们，我们将在24个工作小时内回复您",
    contactUsBottom: "联系我们",
  } : {
    supportCenter: "SUPPORT CENTER",
    heroTitle: "We're Here to Help",
    heroDesc: "Find answers, download resources, and get expert support for your Fotobestway professional equipment.",
    contactSupport: "CONTACT SUPPORT",
    downloadCenter: "Download Center",
    downloadDesc: "Access product manuals, spec sheets, and marketing resources",
    download: "DOWNLOAD",
    comingSoon: "Coming soon...",
    downloadNote: "Need a specific document you don't see here?",
    contactTeam: "Contact our team",
    downloadNote2: "and we'll get it to you right away.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Find quick answers to common questions about our products and services",
    quickOptions: "Quick Support Options",
    quickOptionsDesc: "Choose the support channel that works best for you",
    emailSupport: "Email Support",
    emailSupportDesc: "Get personalized help from our technical support team",
    contactUs: "Contact Us",
    quickResponse: "Quick Response",
    quickResponseDesc: "Response within 24 hours on business days",
    sendEmail: "Send Email",
    productInfo: "Product Info",
    productInfoDesc: "Find detailed specs for all our products",
    browseProducts: "Browse Products",
    qualityTrust: "Quality You Can Trust",
    qualityDesc: "Every Fotobestway product is built to professional standards and backed by our comprehensive warranty and support program.",
    warranty2: "2-Year Standard Warranty",
    warranty2Desc: "Coverage for all manufacturing defects",
    consumable90: "90-Day Consumable Coverage",
    consumable90Desc: "Bulbs, filters, and fabric parts included",
    extendedWarranty: "Extended Warranty Options",
    extendedWarrantyDesc: "Available for bulk and OEM orders",
    globalParts: "Global Parts Support",
    globalPartsDesc: "Replacement parts shipped worldwide",
    needWarranty: "Need Warranty Service?",
    needWarrantyDesc: "Contact our support team with your order number and product details, and we'll guide you through the warranty process.",
    startClaim: "START A WARRANTY CLAIM",
    stillQuestions: "Still Have Questions?",
    stillQuestionsDesc: "Our support team is here to help. Reach out and we'll get back to you within 24 business hours.",
    contactUsBottom: "CONTACT US",
  };

  const localePrefix = isZh ? "/zh" : "/en";

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
          <div className="supportHeroLabel">{labels.supportCenter}</div>
          <h1>{labels.heroTitle}</h1>
          <p>{labels.heroDesc}</p>
          <Link href={`${localePrefix}/contact`} className="supportHeroBtn">
            {labels.contactSupport}
          </Link>
        </div>
      </section>

      {/* Downloads Section - 排第一 */}
      <section className="supportDownloads">
        <div className="supportSectionHeader">
          <h2>{labels.downloadCenter}</h2>
          <p>{labels.downloadDesc}</p>
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
                      {labels.download}
                    </a>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <p style={{ color: "#999", fontSize: "14px", padding: "10px 0" }}>
                    {labels.comingSoon}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="downloadNote">
          <p>
            {labels.downloadNote}{" "}
            <Link href={`${localePrefix}/contact`}>{labels.contactTeam}</Link> {labels.downloadNote2}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="supportFAQ">
        <div className="supportSectionHeader">
          <h2>{labels.faqTitle}</h2>
          <p>{labels.faqDesc}</p>
        </div>

        <div className="faqContainer">
          <FAQAccordion items={translatedFaq} />
        </div>
      </section>

      {/* Quick Support Options - 放在 FAQ 后面 */}
      <section className="supportQuickOptions">
        <div className="supportSectionHeader">
          <h2>{labels.quickOptions}</h2>
          <p>{labels.quickOptionsDesc}</p>
        </div>

        <div className="supportOptionsGrid">
          <Link href={`${localePrefix}/contact`} className="supportOptionCard">
            <div className="optionNumber">01</div>
            <h3>{labels.emailSupport}</h3>
            <p>{labels.emailSupportDesc}</p>
            <span className="optionBtn">{labels.contactUs}</span>
          </Link>

          <a href="mailto:info@fotobestway.com.cn" className="supportOptionCard">
            <div className="optionNumber">02</div>
            <h3>{labels.quickResponse}</h3>
            <p>{labels.quickResponseDesc}</p>
            <span className="optionBtn">{labels.sendEmail}</span>
          </a>

          <Link href={`${localePrefix}/products`} className="supportOptionCard">
            <div className="optionNumber">03</div>
            <h3>{labels.productInfo}</h3>
            <p>{labels.productInfoDesc}</p>
            <span className="optionBtn">{labels.browseProducts}</span>
          </Link>
        </div>
      </section>

      {/* Warranty Section */}
      <section className="supportWarranty">
        <div className="warrantyContent">
          <div className="warrantyText">
            <h2>{labels.qualityTrust}</h2>
            <p className="warrantyDesc">
              {labels.qualityDesc}
            </p>

            <div className="warrantyFeatures">
              <div className="warrantyFeature">
                <div className="warrantyIcon">01</div>
                <div>
                  <h4>{labels.warranty2}</h4>
                  <p>{labels.warranty2Desc}</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">02</div>
                <div>
                  <h4>{labels.consumable90}</h4>
                  <p>{labels.consumable90Desc}</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">03</div>
                <div>
                  <h4>{labels.extendedWarranty}</h4>
                  <p>{labels.extendedWarrantyDesc}</p>
                </div>
              </div>
              <div className="warrantyFeature">
                <div className="warrantyIcon">04</div>
                <div>
                  <h4>{labels.globalParts}</h4>
                  <p>{labels.globalPartsDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="warrantyCTA">
            <h3>{labels.needWarranty}</h3>
            <p>
              {labels.needWarrantyDesc}
            </p>
            <Link href={`${localePrefix}/contact`} className="warrantyBtn">
              {labels.startClaim}
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="supportBottomCTA">
        <div className="bottomCTAContent">
          <h2>{labels.stillQuestions}</h2>
          <p>
            {labels.stillQuestionsDesc}
          </p>
          <Link href={`${localePrefix}/contact`} className="bottomCTABtn">
            {labels.contactUsBottom}
          </Link>
        </div>
      </section>
    </main>
  );
}
