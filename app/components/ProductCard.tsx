import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@prisma/client";
import AddToInquiryCardButton from "./AddToInquiryCardButton";
import { getMessages } from "@/app/i18n/messages";

type ProductCardData = Product & {
  categoryRef: Category | null;
};

export default function ProductCard({
  product,
  locale = "en",
}: {
  product: ProductCardData;
  locale?: string;
}) {
  const t = getMessages(locale as any);

  // 解析特性列表
  const features = Array.isArray(product.features)
    ? (product.features as string[]).filter((f) => f && f.trim() !== "")
    : [];

  const hasMore = features.length > 3;
  const displayFeatures = features.slice(0, 3);
  const useTwoColumns = hasMore;

  const leftFeatures = displayFeatures.slice(0, 2);
  const rightFeatures = displayFeatures.slice(2, 3);

  // 分类名翻译
  const categoryName = product.categoryRef?.slug
    ? (t.categories as Record<string, string>)[product.categoryRef.slug] || product.categoryRef?.name
    : product.categoryRef?.name;

  return (
    <article className="productCard">
      <div className="productCardImage">
        <Image
          src={product.image || "/products/light.jpg"}
          alt={product.title}
          fill
          sizes="(max-width: 760px) 50vw, (max-width: 1000px) 50vw, 33vw"
          className="productCardImg"
          loading="lazy"
        />
      </div>
      <div className="productCardBody">
        <div className="productCategory">{categoryName}</div>
        <h3>
          <Link href={`/${locale}/products/${product.slug}`} className="productCardTitle">
            {product.title}
          </Link>
        </h3>
        <div className="productCardFeatures">
          <div className="productCardFeaturesTitle">{t.products.keyFeatures}</div>
          {features.length > 0 ? (
            <div className={`cardFeaturesList ${useTwoColumns ? "two-col" : ""}`}>
              {useTwoColumns ? (
                <>
                  <div className="cardFeaturesCol">
                    {leftFeatures.map((feature, index) => (
                      <div key={index} className="cardFeatureItem">
                        <span className="cardFeatureDot"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cardFeaturesCol">
                    {rightFeatures.map((feature, index) => (
                      <div key={index} className="cardFeatureItem">
                        <span className="cardFeatureDot"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                    <Link
                      href={`/${locale}/products/${product.slug}`}
                      className="cardFeaturesMore"
                    >
                      <span className="cardFeatureDot"></span>
                      <span>{t.products.showMore} →</span>
                    </Link>
                  </div>
                </>
              ) : (
                displayFeatures.map((feature, index) => (
                  <div key={index} className="cardFeatureItem">
                    <span className="cardFeatureDot"></span>
                    <span>{feature}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            (product.shortDescription || product.overview) && (
              <p className="productCardOverview">
                {product.shortDescription || product.overview}
              </p>
            )
          )}
        </div>
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="productCardButton"
          style={locale === "zh" ? { fontSize: "15px", letterSpacing: "0" } : undefined}
        >
          <span>{t.products.viewDetails}</span>
          <span aria-hidden="true">→</span>
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
    </article>
  );
}
