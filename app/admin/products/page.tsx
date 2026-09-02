import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import ProductManager from "./ProductManager";

// 强制动态渲染，避免缓存导致新增产品不显示
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // 读取角色：limited（内部人员）只保留导出，隐藏新增/编辑/删除
  const role = (await cookies()).get("admin_role")?.value || "admin";
  const isLimited = role === "limited";

  const [products, categories] = await Promise.all([
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

      <ProductManager products={products as any} categories={categories as any} isLimited={isLimited} />
    </div>
  );
}
