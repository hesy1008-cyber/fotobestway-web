import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import CategoryManager from "./CategoryManager";

// 强制动态渲染，避免缓存
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: { select: { id: true } },
      subCategories: {
        include: {
          products: { select: { id: true, title: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // 获取所有直接挂在一级分类下且没有二级分类的产品
  const unassignedProducts = await prisma.product.findMany({
    where: { subCategoryId: null },
    select: { id: true, title: true, categoryId: true },
  });

  // 按 categoryId 分组
  const unassignedByCategory: Record<string, { id: string; title: string }[]> = {};
  for (const p of unassignedProducts) {
    if (p.categoryId) {
      if (!unassignedByCategory[p.categoryId]) {
        unassignedByCategory[p.categoryId] = [];
      }
      unassignedByCategory[p.categoryId].push({ id: p.id, title: p.title });
    }
  }

  // 把未分配产品合并到每个分类里
  const categoriesWithUnassigned = categories.map((cat) => ({
    ...cat,
    unassignedProducts: unassignedByCategory[cat.id] || [],
  }));

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">分类管理</h1>
          <p className="admin-page-subtitle">
            管理产品分类与子分类（共 {categories.length} 个分类）
          </p>
        </div>
        <Link href="/admin/categories/new" className="admin-btn admin-btn-primary">
          + 新增分类
        </Link>
      </div>

      <CategoryManager categories={categoriesWithUnassigned as any} />
    </div>
  );
}
