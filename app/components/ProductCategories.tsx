import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getMessages } from "@/app/i18n/messages";
import { type Locale } from "@/app/i18n/config";

export default async function ProductCategories({ locale = "en" }: { locale?: string }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const t = getMessages(locale as Locale);

  return (
    <section className="categorySection">
      <div className="categoryHeader">
        <span>{t.home.productRangeLabel}</span>
        <h2>{t.home.exploreProducts}</h2>
        <p>{t.home.productsSubtitle}</p>
      </div>

      <div className="categoryGrid">
        {categories.map((item) => {
          // 优先用翻译文件里的分类名称，没有就用数据库里的
          const categoryName = t.categories[item.slug as keyof typeof t.categories] || item.name;
          
          return (
            <Link
              key={item.slug}
              href={`/${locale}/products?category=${item.slug}`}
              className="categoryItem"
            >
              <Image
                src={item.bannerImage || "/categories/lighting.jpg"}
                alt={categoryName}
                fill
                sizes="50vw"
                className="categoryImage"
                loading="lazy"
              />

              <div className="categoryMask"></div>

              <div className="categoryText">
                <h3>{categoryName}</h3>
                <p>{t.home.learnMoreArrow}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
