import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@prisma/client";
import AddToInquiryCardButton from "./AddToInquiryCardButton";
import { getMessages } from "@/app/i18n/messages";

type ProductListCardData = Product & {
  categoryRef: Category | null;
};

export default function ProductListCard({
  product,
  locale = "en",
}: {
  product: ProductListCardData;
  locale?: string;
}) {
  const t = getMessages(locale as any);

  const features = Array.isArray(product.features)
    ? (product.features as string[]).filter((f) => f && f.trim() !== "")
    : [];

  // 最多显示4个features，超过的显示show more
  const hasMore = features.length > 4;
  const displayFeatures = features.slice(0, 4);
  const mid = Math.ceil(displayFeatures.length / 2);
  const leftFeatures = displayFeatures.slice(0, mid);
  const rightFeatures = displayFeatures.slice(mid);

  // 分类名翻译
  const categoryName = product.categoryRef?.slug
    ? (t.categories as Record<string, string>)[product.categoryRef.slug] || product.categoryRef?.name
    : product.categoryRef?.name;

  return (
    <article className="productListCard">
      <div className="productListCardImage">
        <Image
          src={product.image || "/products/light.jpg"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="productListCardImg"
          loading="lazy"
        />
      </div>

      <div className="productListCardContent">
        <div className="productListCardHeader">
          <div className="productListCardInfo">
            <div className="productListCategory">
              {(categoryName || t.products.product)?.toUpperCase()}
            </div>
            <Link href={`/${locale}/products/${product.slug}`} className="productListTitle">
              {product.title}
            </Link>
            <p className="productListDesc">{product.overview}</p>
          </div>

          <div className="productListCardActions">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="viewDetailsBtn"
              style={locale === "zh" ? { fontSize: "15px", letterSpacing: "0" } : undefined}
            >
              <span>{t.products.viewDetails}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <AddToInquiryCardButton
              productId={product.id}
              productSlug={product.slug}
              productTitle={product.title}
              productImage={product.image || "/products/light.jpg"}
              locale={locale}
              isZh={locale === "zh"}
            />
          </div>
        </div>

        {features.length > 0 && (
          <div className="productListFeatures">
            <div className="featuresTitle">
              <span className="featuresLine"></span>
              <span>{t.products.keyFeatures}</span>
            </div>
            <div className="featuresGrid">
              <div className="featuresColumn">
                {leftFeatures.map((feature, index) => (
                  <div key={index} className="featureItem">
                    <span className="featureDot">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="featuresColumn">
                {rightFeatures.map((feature, index) => (
                  <div key={index} className="featureItem">
                    <span className="featureDot">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
                {hasMore && (
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="featureShowMore"
                  >
                    <span className="featureDot">•</span>
                    <span>{t.products.showMore} →</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="productCardStock">
        <span className="stockDot"></span>
        <span>{t.products.inStock}</span>
      </div>
    </article>
  );
}
