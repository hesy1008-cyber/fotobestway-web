import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import ProductListCard from "@/app/components/ProductListCard";
import CategoryHero from "@/app/components/CategoryHero";
import ProductSearch from "@/app/components/ProductSearch";
import ViewToggle from "@/app/components/ViewToggle";
import { getMessages } from "@/app/i18n/messages";
import "../styles/products.css";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string; view?: string }>;
}) {
  const params = await searchParams;
  const t = getMessages("en");
  const currentCategory = params.category || "";
  const currentSubCategory = params.subCategory || "";
  const currentView = params.view || "list";

  // 翻译辅助函数
  const getCategoryName = (slug: string, fallback: string) => {
    return (t.categories as Record<string, string>)[slug] || fallback;
  };
  const getSubCategoryName = (categorySlug: string, subSlug: string, fallback: string) => {
    const subs = (t.subCategories as Record<string, Record<string, string>>)[categorySlug];
    return (subs && subs[subSlug]) || fallback;
  };
  const getSubCategoryDesc = (categorySlug: string, subSlug: string, fallback: string) => {
    const descs = (t.subCategoryDescriptions as Record<string, Record<string, string>>)[categorySlug];
    return (descs && descs[subSlug]) || fallback;
  };

  // 从数据库读取所有分类，按 sortOrder 排序
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subCategories: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // 当前选中的分类
  const selectedCategory = currentCategory
    ? await prisma.category.findUnique({
        where: { slug: currentCategory },
        include: {
          subCategories: {
            orderBy: { sortOrder: "asc" },
          },
        },
      })
    : null;

  // 当前选中的二级分类
  const selectedSubCategory = currentSubCategory
    ? await prisma.subCategory.findFirst({
        where: { slug: currentSubCategory },
      })
    : null;

  // 产品列表
  const products = await prisma.product.findMany({
    include: {
      categoryRef: true,
      subCategoryRef: true,
    },
    where: {
      ...(currentCategory ? { categoryRef: { slug: currentCategory } } : {}),
      ...(currentSubCategory ? { subCategoryRef: { slug: currentSubCategory } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  // 按分类排序 + 标题排序
  const categoryOrderMap: Record<string, number> = {};
  categories.forEach((cat, index) => {
    categoryOrderMap[cat.slug] = cat.sortOrder || index;
  });

  products.sort((a, b) => {
    const categoryA = categoryOrderMap[a.categoryRef?.slug || ""] || 99;
    const categoryB = categoryOrderMap[b.categoryRef?.slug || ""] || 99;
    return categoryA !== categoryB
      ? categoryA - categoryB
      : a.title.localeCompare(b.title);
  });

  // 搜索用的产品数据
  const searchProducts = products.map((product) => ({
    title: product.title,
    slug: product.slug,
    categoryRef: product.categoryRef
      ? {
          name: product.categoryRef.name,
          slug: product.categoryRef.slug,
        }
      : null,
  }));

  // 默认 Hero 数据
  const defaultHero = {
    title: t.products.allProducts,
    desc: "Explore our complete range of photography equipment.",
  };

  const heroTitle = selectedSubCategory
    ? getSubCategoryName(currentCategory, selectedSubCategory.slug, selectedSubCategory.name)
    : selectedCategory
    ? getCategoryName(selectedCategory.slug, selectedCategory.name)
    : defaultHero.title;
  const heroDesc = selectedSubCategory
    ? getSubCategoryDesc(currentCategory, selectedSubCategory.slug, `Explore our ${getSubCategoryName(currentCategory, selectedSubCategory.slug, selectedSubCategory.name).toLowerCase()} collection.`)
    : selectedCategory?.bannerDescription || defaultHero.desc;
  const heroImage = selectedCategory?.bannerImage || "/studio3.jpg";

  const currentCategoryName = selectedSubCategory
    ? getSubCategoryName(currentCategory, selectedSubCategory.slug, selectedSubCategory.name)
    : selectedCategory
    ? getCategoryName(selectedCategory.slug, selectedCategory.name)
    : "";

  // 左上角标签：只有选中二级分类时才显示一级分类名
  const parentCategoryName = selectedSubCategory && selectedCategory
    ? getCategoryName(selectedCategory.slug, selectedCategory.name)
    : "";

  return (
    <main className="productsPage">
      <CategoryHero
        category={parentCategoryName}
        title={heroTitle}
        description={heroDesc}
        image={heroImage}
      />

      <section className="productBenefits" aria-label="Fotobestway advantages">
        <div className="benefitItem">
          <span className="benefitIcon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
              <path d="M2 9h20" />
              <path d="M12 3v6" />
              <path d="M8 9l4 12" />
              <path d="M16 9l-4 12" />
              <path d="M6 3L2 9" />
              <path d="M18 3l4 6" />
            </svg>
          </span>
          <div>
            <strong>PROFESSIONAL QUALITY</strong>
            <span>Reliable equipment for professionals</span>
          </div>
        </div>
        <div className="benefitItem">
          <span className="benefitIcon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <strong>SUPERIOR PERFORMANCE</strong>
            <span>High output, accurate color</span>
          </div>
        </div>
        <div className="benefitItem">
          <span className="benefitIcon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" />
              <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <strong>BUILT TO LAST</strong>
            <span>Durable, safe and reliable</span>
          </div>
        </div>
        <div className="benefitItem">
          <span className="benefitIcon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18V12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12V18" strokeLinecap="round" />
              <path d="M21 19C21 20.66 19.66 22 18 22H17V16H18C19.66 16 21 17.34 21 19Z" />
              <path d="M3 19C3 20.66 4.34 22 6 22H7V16H6C4.34 16 3 17.34 3 19Z" />
            </svg>
          </span>
          <div>
            <strong>GLOBAL SUPPORT</strong>
            <span>Worldwide service &amp; support</span>
          </div>
        </div>
      </section>

      <section className="productLayout">
        <aside className="categorySidebar">
          <h2>Categories</h2>
          <ProductSearch products={searchProducts} />
          <div className="categoryMenu">
            <Link
              href={`/en/products`}
              className={`categoryLink ${currentCategory === "" ? "active" : ""}`}
            >
              <span>—</span>
              {t.products.allProducts}
            </Link>
            {categories.map((category, index) => (
              <div key={category.slug}>
                <Link
                  href={`/en/products?category=${category.slug}`}
                  className={`categoryLink ${
                    currentCategory === category.slug ? "active" : ""
                  }`}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {getCategoryName(category.slug, category.name)}
                </Link>

                {/* 二级分类 - 当选中该一级分类时显示 */}
                {currentCategory === category.slug &&
                  category.subCategories.length > 0 && (
                    <div className="subCategoryMenu">
                      {category.subCategories.map((subCat, subIndex) => (
                        <Link
                          key={subCat.slug}
                          href={`/en/products?category=${category.slug}&subCategory=${subCat.slug}`}
                          className={`subCategoryLink ${
                            currentSubCategory === subCat.slug ? "active" : ""
                          }`}
                        >
                          <span>{String(subIndex + 1).padStart(2, "0")}</span>
                          {getSubCategoryName(category.slug, subCat.slug, subCat.name)}
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </aside>

        <section className="productListSection">
          <div className="sectionHeader">
            <div>
              <h2>{currentCategoryName || t.products.allProducts}</h2>
              <p>
                {currentSubCategory
                  ? `Discover our professional ${currentCategoryName.toLowerCase()} collection.`
                  : currentCategory
                  ? `Discover our complete range of professional ${currentCategoryName.toLowerCase()}.`
                  : "Professional equipment for studio lighting applications."}
              </p>
            </div>
            <ViewToggle />
          </div>

          <section
            className={currentView === "grid" ? "productsGrid" : "productsList"}
            id="products"
          >
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : currentView === "grid" ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              products.map((product) => (
                <ProductListCard key={product.id} product={product} />
              ))
            )}
          </section>

          <section className="helpBanner">
            <svg className="helpIcon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18V12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12V18" strokeLinecap="round" />
              <path d="M21 19C21 20.66 19.66 22 18 22H17V16H18C19.66 16 21 17.34 21 19Z" fill="#fff" stroke="none" />
              <path d="M3 19C3 20.66 4.34 22 6 22H7V16H6C4.34 16 3 17.34 3 19Z" fill="#fff" stroke="none" />
            </svg>
            <div>
              <strong>NEED HELP CHOOSING?</strong>
              <span>Our lighting experts are here to help you find the perfect solution.</span>
            </div>
            <Link href="/en/contact">CONTACT US <span aria-hidden="true">→</span></Link>
          </section>
        </section>
      </section>
    </main>
  );
}
