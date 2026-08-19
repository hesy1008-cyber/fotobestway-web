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
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">
            Manage your product categories and sub-categories ({categories.length} categories total)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="admin-btn admin-btn-primary"
        >
          + Add Category
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
                  Slug: {category.slug} · {category.products.length} products ·{" "}
                  {category.subCategories.length} sub-categories
                </p>
              </div>
            </div>
            <div className="admin-card-actions">
              <Link
                href={`/admin/categories/${category.id}/sub-categories`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Sub-Categories
              </Link>
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Edit
              </Link>
              <DeleteCategoryButton id={category.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
