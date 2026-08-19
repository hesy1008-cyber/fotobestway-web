import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import DeleteCategoryButton from "./DeleteCategoryButton";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
      subCategories: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
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
        <Link
          href="/admin/categories/new"
          className="admin-btn admin-btn-primary"
        >
          + 新增分类
        </Link>
      </div>

      {/* 分类列表 */}
      <div className="admin-list">
        {categories.map((category, index) => (
          <div key={category.id} className="admin-card admin-category-card">
            <div className="admin-category-left">
              <div className="admin-category-badge">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="admin-category-info">
                <h3>{category.name}</h3>
                <p>
                  分类名称：{category.slug} · {category.products.length} 个产品 ·{" "}
                  {category.subCategories.length} 个子分类
                </p>
              </div>
            </div>
            <div className="admin-card-actions">
              <Link
                href={`/admin/categories/${category.id}/sub-categories`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                子分类
              </Link>
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                编辑
              </Link>
              <DeleteCategoryButton id={category.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
