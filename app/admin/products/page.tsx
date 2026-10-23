import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import ProductManager, { type ProductSimple, type CategorySimple } from "./ProductManager";

// 强制动态渲染，避免缓存导致新增产品不显示
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // 读取角色：limited（内部人员）只保留导出，隐藏新增/编辑/删除
  const role = (await cookies()).get("admin_role")?.value || "admin";
  const isLimited = role === "limited";

  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        categoryId: true,
        categoryRef: { select: { name: true } },
        gallery: true,
        detailImages: true,
      },
      orderBy: [{ title: "asc" }],
    }),
    prisma.category.findMany({
      include: {
        products: { select: { id: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Prisma 的 JSON 字段映射为 string[]（类型安全，去掉 as any）
  const products: ProductSimple[] = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.image,
    categoryId: p.categoryId,
    categoryRef: p.categoryRef,
    gallery: Array.isArray(p.gallery)
      ? p.gallery.filter((x): x is string => typeof x === "string")
      : null,
    detailImages: Array.isArray(p.detailImages)
      ? p.detailImages.filter((x): x is string => typeof x === "string")
      : null,
  }));

  const categoriesProp: CategorySimple[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    bannerImage: c.bannerImage,
    products: c.products,
  }));

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">产品列表</h1>
          <p className="admin-page-subtitle">
            管理产品目录（共 {products.length} 个产品）
          </p>
        </div>
        {!isLimited && (
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            + 新增产品
          </Link>
        )}
      </div>

      <ProductManager products={products} categories={categoriesProp} isLimited={isLimited} />
    </div>
  );
}
