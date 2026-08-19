import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import DeleteSubCategoryButton from "../../DeleteSubCategoryButton";

export default async function SubCategoriesPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
    include: {
      subCategories: {
        include: {
          products: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Sub-Categories</h1>
          <p className="admin-page-subtitle">
            {category.name} - {category.subCategories.length} sub-categories
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/admin/categories"
            className="admin-btn admin-btn-secondary"
          >
            ← Back to Categories
          </Link>
          <Link
            href={`/admin/categories/${id}/sub-categories/new`}
            className="admin-btn admin-btn-primary"
          >
            + Add Sub-Category
          </Link>
        </div>
      </div>

      {/* 二级分类列表 */}
      <div className="admin-list">
        {category.subCategories.length === 0 && (
          <div className="admin-card" style={{ textAlign: "center", color: "#999", padding: "60px" }}>
            No sub-categories yet. Click "Add Sub-Category" to create one.
          </div>
        )}

        {category.subCategories.map((subCategory, index) => (
          <div key={subCategory.id} className="admin-card admin-category-card">
            <div className="admin-category-left">
              <div className="admin-category-badge">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="admin-category-info">
                <h3>{subCategory.name}</h3>
                <p>
                  Slug: {subCategory.slug} · {subCategory.products.length} products
                </p>
              </div>
            </div>
            <div className="admin-card-actions">
              <Link
                href={`/admin/categories/${id}/sub-categories/${subCategory.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Edit
              </Link>
              <DeleteSubCategoryButton
                id={subCategory.id}
                categoryId={id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
