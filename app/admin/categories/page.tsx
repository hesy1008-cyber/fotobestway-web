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

      <CategoryManager categories={categories as any} />
    </div>
  );
}
