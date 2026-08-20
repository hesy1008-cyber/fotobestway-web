import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

import ProductGallery from "@/app/components/ProductGallery";
import RelatedProducts from "@/app/components/RelatedProducts";
import ProductAccordion from "@/app/components/ProductAccordion";
import AddToInquiryButton from "@/app/components/AddToInquiryButton";
import DetailImage from "@/app/components/DetailImage";
import SocialIcons from "@/app/components/SocialIcons";
import { translateProduct } from "@/app/lib/translate";

import "@/app/styles/detail.css";

// 生成产品页 SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      shortDescription: true,
      overview: true,
      image: true,
      coverImage: true,
      imageAlt: true,
      seoTitle: true,
      metaDescription: true,
      focusKeywords: true,
      categoryRef: { select: { name: true } },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | Fotobestway",
    };
  }

  // 标题：优先用后台填写的 SEO Title，没有则用默认格式
  const title = product.seoTitle || `${product.title}${product.categoryRef?.name ? ` - ${product.categoryRef.name}` : ""} | Fotobestway`;

  // 描述：优先用后台填写的 Meta Description，没有则用默认逻辑
  const description = product.metaDescription || (() => {
    const rawDesc =
      product.shortDescription ||
      (product.overview ? product.overview.replace(/\s+/g, " ").trim() : "");
    return rawDesc
      ? rawDesc.slice(0, 160)
      : `${product.title} - Professional photography equipment from Fotobestway.`;
  })();

  // 关键词：优先用后台填写的 Focus Keywords，没有则用默认
  const keywords = product.focusKeywords
    ? product.focusKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        product.title,
        product.categoryRef?.name || "photography equipment",
        "Fotobestway",
        "OEM",
        "ODM",
        "studio lighting",
      ].filter(Boolean) as string[];

  const ogImage = product.coverImage || product.image;
  const ogImageAlt = product.imageAlt || product.title;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: ogImageAlt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}) {
  const { slug, locale } = await params;

  const originalProduct = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      categoryRef: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      subCategoryRef: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      id: true,
      slug: true,
      title: true,
      image: true,
      imageAlt: true,
      coverImage: true,
      detailImages: true,
      gallery: true,
      shortDescription: true,
      overview: true,
      features: true,
      applications: true,
      specs: true,
      video: true,
      featureIcons: true,
      seoTitle: true,
      metaDescription: true,
      focusKeywords: true,
      hiddenSeoText: true,
    },
  });

  if (!originalProduct) {
    notFound();
  }

  // 中文语言下自动翻译产品内容
  let product = originalProduct;
  if (locale === "zh") {
    product = await translateProduct(originalProduct);
  }

  // 主图
  const mainImage = product.coverImage || product.image || "";

  // 画廊图片
  const galleryImagesRaw = Array.isArray(product.gallery)
    ? (product.gallery as string[]).filter((img) => img && img.trim() !== "")
    : [];
  const galleryImages = galleryImagesRaw.length > 0 ? galleryImagesRaw : [mainImage];

  // 详情图（过滤掉不存在的文件）
  const detailImagesRaw = Array.isArray(product.detailImages)
    ? (product.detailImages as string[]).filter((img) => img && img.trim() !== "")
    : [];

  // 检查文件是否存在
  const validDetailImages = [];
  for (const img of detailImagesRaw) {
    try {
      const filePath = path.join(process.cwd(), "public", img);
      await fs.access(filePath);
      validDetailImages.push(img);
    } catch {
      // 文件不存在，跳过
    }
  }

  // 特性列表（用于右侧4个图标）
  const featuresList = Array.isArray(product.features)
    ? (product.features as string[]).filter((f) => f && f.trim() !== "")
    : [];

  // 特性图标配置
  const featureIconsList = Array.isArray(product.featureIcons)
    ? (product.featureIcons as { icon: string; text: string }[]).filter(
        (f) => f.text && f.text.trim() !== ""
      )
    : [];

  // 如果有自定义的特性图标，就用自定义的；否则用 features 数组的前4个
  const displayFeatures =
    featureIconsList.length > 0
      ? featureIconsList
      : featuresList.slice(0, 4).map((text, index) => ({
          icon: ["bolt", "sun", "palette", "fan"][index] || "bolt",
          text,
        }));

  // 短描述（标题下面的小字）
  const shortDesc = product.shortDescription || product.overview || "";

  // Related Products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryRef?.id,
      NOT: {
        id: product.id,
      },
    },
    take: 3,
    orderBy: {
      id: "desc",
    },
  });

  // 特性图标 SVG 组件（线框风格，与产品页统一）
  const FeatureIcon = ({ iconName }: { iconName: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
      bolt: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      sun: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" strokeLinecap="round" />
        </svg>
      ),
      palette: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10c0 1.1-.22 2.18-.62 3.18-.2.5-.23 1.07-.07 1.6.16.53.5.97.94 1.2.69.36 1.02 1.17.75 1.88-.27.71-1.01 1.14-1.75 1.14H12z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      fan: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.5 2.5-2 3.5S10 11 10 12s.5 2.5 2 3.5 2 2 2 3.5a4 4 0 0 1-4 4" strokeLinecap="round" />
          <path d="M12 2a4 4 0 0 0-4 4c0 1.5.5 2.5 2 3.5S14 11 14 12s-.5 2.5-2 3.5-2 2-2 3.5a4 4 0 0 0 4 4" strokeLinecap="round" />
          <path d="M2 12a4 4 0 0 1 4-4c1.5 0 2.5.5 3.5 2S11 10 12 10s2.5-.5 3.5-2 2-2 3.5-2a4 4 0 0 1 4 4" strokeLinecap="round" />
          <path d="M2 12a4 4 0 0 0 4 4c1.5 0 2.5-.5 3.5-2S10 14 12 14s2.5.5 3.5 2 2 2 3.5 2a4 4 0 0 0 4-4" strokeLinecap="round" />
        </svg>
      ),
      shield: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      gear: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
        </svg>
      ),
      ruler: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3H3v18h18V3z" />
          <path d="M7 3v4M11 3v6M15 3v4M19 3v6M7 17v4M11 15v6M15 17v4" strokeLinecap="round" />
        </svg>
      ),
      wrench: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    };
    return iconMap[iconName] || iconMap.bolt;
  };

  return (
    <main className="product-detail-page">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.title,
            description: product.metaDescription || product.shortDescription || product.overview,
            image: [mainImage],
            brand: {
              "@type": "Brand",
              name: "Fotobestway",
            },
            sku: product.slug,
            category: product.categoryRef?.name || "Photography Equipment",
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: "0",
              availability: "https://schema.org/InStock",
              url: `https://www.fotobestway.com.cn/products/${product.slug}`,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5.0",
              reviewCount: "100",
            },
          }),
        }}
      />

      {/* 面包屑导航 */}
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/products">Products</Link>
        <span className="breadcrumb-sep">/</span>
        {product.categoryRef && (
          <>
            <Link href={`/products?category=${product.categoryRef.slug}`}>
              {product.categoryRef.name}
            </Link>
            <span className="breadcrumb-sep">/</span>
          </>
        )}
        {product.subCategoryRef && (
          <>
            <Link
              href={`/products?category=${product.categoryRef?.slug}&subCategory=${product.subCategoryRef.slug}`}
            >
              {product.subCategoryRef.name}
            </Link>
            <span className="breadcrumb-sep">/</span>
          </>
        )}
        <span className="breadcrumb-current">{product.title}</span>
      </div>

      {/* 产品主展示区 */}
      <section className="product-main">
        {/* 左侧缩略图 + 中间主图 */}
        <div className="product-gallery-wrapper">
          <ProductGallery
            images={galleryImages}
            video={product.video || undefined}
            title={product.title}
            mainImageAlt={product.imageAlt || undefined}
          />
        </div>

        {/* 右侧产品信息 */}
        <div className="product-info-wrapper">
          {/* 分类标签 */}
          <div className="product-category-tag">
            {product.subCategoryRef
              ? product.subCategoryRef.name.toUpperCase()
              : product.categoryRef?.name?.toUpperCase()}
          </div>

          {/* 产品标题 */}
          <h1 className="product-title">{product.title}</h1>

          {/* 产品描述 */}
          <p className="product-short-desc">{shortDesc}</p>

          {/* Key Features 列表 */}
          {featuresList.length > 0 && (
            <div className="product-key-features">
              <div className="key-features-title">KEY FEATURES</div>
              <div className="key-features-list">
                {featuresList.map((feature, index) => (
                  <div key={index} className="key-feature-item">
                    <span className="key-feature-dot"></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA 按钮 */}
          <div className="product-cta-buttons">
            <Link
              href={`/contact?product=${product.slug}`}
              className="btn-primary-red"
            >
              CONTACT US
            </Link>
            <AddToInquiryButton
              productId={product.id}
              productSlug={product.slug}
              productTitle={product.title}
              productImage={mainImage}
            />
          </div>

          {/* SKU 和 Category 信息 */}
          <div className="product-meta">
            {/* 社媒图标 - 靠左 */}
            <div>
              <SocialIcons size={24} vibrant={true} />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">FBW-{product.slug.toUpperCase()}</span>
              </div>
              {product.categoryRef && (
                <>
                  <span className="meta-divider">|</span>
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{product.categoryRef.name}</span>
                  </div>
                </>
              )}
              {product.subCategoryRef && (
                <>
                  <span className="meta-divider">|</span>
                  <div className="meta-item">
                    <span className="meta-label">Type:</span>
                    <span className="meta-value">{product.subCategoryRef.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 手风琴折叠面板 */}
          <ProductAccordion
            items={[
              ...(product.overview && product.overview.trim()
                ? [
                    {
                      title: "OVERVIEW",
                      content: <p className="accordion-text">{product.overview}</p>,
                    },
                  ]
                : []),
              ...(Array.isArray(product.applications) &&
                (product.applications as string[]).filter((a) => a && typeof a === "string" && a.trim()).length > 0
                ? [
                    {
                      title: "APPLICATIONS",
                      content: (
                        <ul className="accordion-list">
                          {(product.applications as string[])
                            .filter((a) => a && typeof a === "string" && a.trim())
                            .map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                        </ul>
                      ),
                    },
                  ]
                : []),
              ...(() => {
                // 检查 specs 是否有有效内容
                let hasValidSpecs = false;
                const specsAny = product.specs as any;
                const isMultiModel = Array.isArray(specsAny) && specsAny.length > 0 && specsAny[0]?.model !== undefined;

                if (isMultiModel) {
                  hasValidSpecs = specsAny.some(
                    (m: any) => m.specs && m.specs.some((s: any) => s.label?.trim() || s.value?.trim())
                  );
                } else if (Array.isArray(specsAny)) {
                  hasValidSpecs = specsAny.some(
                    (s: any) => s && (s.label || s.value) && (s.label?.trim() || s.value?.trim())
                  );
                } else if (typeof specsAny === "object" && specsAny) {
                  hasValidSpecs = Object.entries(specsAny as Record<string, string>).some(
                    ([key, value]) => key?.trim() || value?.trim()
                  );
                }
                if (!hasValidSpecs) return [];
                return [
                  {
                    title: "SPECIFICATIONS",
                    content: (
                      <div className="specs-table">
                        {isMultiModel ? (
                          // 多型号格式
                          specsAny
                            .filter((m: any) => m.specs && m.specs.some((s: any) => s.label?.trim() || s.value?.trim()))
                            .map((m: any, mi: number) => (
                              <div key={mi} style={{ marginBottom: mi < specsAny.length - 1 ? "24px" : "0" }}>
                                {m.model && (
                                  <h4 style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#e60012",
                                    marginBottom: "12px",
                                    paddingBottom: "8px",
                                    borderBottom: "2px solid #e60012",
                                  }}>
                                    {m.model}
                                  </h4>
                                )}
                                {m.specs
                                  .filter((s: any) => s.label?.trim() || s.value?.trim())
                                  .map((s: any, i: number) => (
                                    <div key={i} className="spec-row">
                                      <span className="spec-label">{s.label}</span>
                                      <span className="spec-value">{s.value}</span>
                                    </div>
                                  ))}
                              </div>
                            ))
                        ) : Array.isArray(specsAny) ? (
                          // 旧格式：数组 [{label, value}]
                          specsAny
                            .filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
                            .map((s: any, i: number) => (
                              <div key={i} className="spec-row">
                                <span className="spec-label">{s.label}</span>
                                <span className="spec-value">{s.value}</span>
                              </div>
                            ))
                        ) : typeof specsAny === "object" && specsAny ? (
                          // 旧格式：对象 {key: value}
                          Object.entries(specsAny as Record<string, string>)
                            .filter(([key, value]) => key?.trim() || value?.trim())
                            .map(([key, value], i) => (
                              <div key={i} className="spec-row">
                                <span className="spec-label">{key}</span>
                                <span className="spec-value">{value}</span>
                              </div>
                            ))
                        ) : null}
                      </div>
                    ),
                  },
                ];
              })(),
            ]}
            defaultOpenIndex={0}
          />
        </div>
      </section>

      {/* 产品详情图 */}
      {validDetailImages.length > 0 && (
        <section className="product-detail-images">
          <div className="container">
            <div className="detail-images-list">
              {validDetailImages.map((img, index) => (
                <div key={index} className="detail-image-item">
                  <DetailImage
                    src={img}
                    alt={`${product.title} detail ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}

      {/* 隐藏 SEO 文案 - 合规视觉隐藏，爬虫可抓取，用户不可见 */}
      {product.hiddenSeoText && (
        <div
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: "0",
          }}
        >
          {product.hiddenSeoText}
        </div>
      )}
    </main>
  );
}
